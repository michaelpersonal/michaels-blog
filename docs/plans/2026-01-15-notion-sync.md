# Notion to Hugo Sync Implementation Plan

> ✅ **STATUS: COMPLETE** (2026-01-16)

**Goal:** Automatically sync blog posts from Notion to Hugo, with scheduled GitHub Actions and auto-deploy to Vercel.

**Architecture:** Notion database → GitHub Actions (scheduled) → Sync script → Git commit → Vercel deploy

---

## Phase 1: Notion Setup

### Task 1: Create Notion Database

**Prerequisites:** Notion account with API integration

**Step 1: Create a new database in Notion**

Create a full-page database called "Blog Posts" with these properties:

| Property | Type | Purpose |
|----------|------|---------|
| Title | Title | Post title (default) |
| Slug | Text | URL slug, e.g., `my-first-post` |
| Status | Select | Options: `Draft`, `Published` |
| Date | Date | Publish date |
| Tags | Multi-select | Post tags |
| Summary | Text | Brief description |

**Step 2: Get Database ID**

Open the database in browser. URL format:
```
https://notion.so/workspace/DATABASE_ID?v=...
```
Copy the DATABASE_ID (32 character hex string).

**Step 3: Share database with integration**

- Click "..." menu → "Connections" → Add your integration

---

## Phase 2: Sync Script Setup

### Task 2: Initialize Node.js Project

**Files:**
- Create: `package.json`

**Step 1: Create package.json**

Create file `package.json`:

```json
{
  "name": "michaels-blog",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "sync": "node scripts/notion-sync.js"
  },
  "dependencies": {
    "@notionhq/client": "^2.2.14",
    "notion-to-md": "^3.1.1"
  }
}
```

**Step 2: Install dependencies**

Run:
```bash
cd ~/code/michaels-blog
npm install
```

**Step 3: Add node_modules to .gitignore**

Append to `.gitignore`:
```
node_modules/
```

---

### Task 3: Create Sync Script

**Files:**
- Create: `scripts/notion-sync.js`

**Step 1: Create scripts directory**

Run:
```bash
mkdir -p ~/code/michaels-blog/scripts
```

**Step 2: Create the sync script**

Create file `scripts/notion-sync.js`:

```javascript
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'posts');
const IMAGES_DIR = path.join(__dirname, '..', 'static', 'images', 'posts');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Download image and return local path
async function downloadImage(url, slug, index) {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  
  const ext = url.includes('.png') ? 'png' : url.includes('.gif') ? 'gif' : 'jpg';
  const filename = `${slug}-${index}.${ext}`;
  const filepath = path.join(IMAGES_DIR, filename);
  
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.open(filepath, 'w').then(fh => {
      protocol.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          downloadImage(response.headers.location, slug, index).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', async () => {
          await fh.write(Buffer.concat(chunks));
          await fh.close();
          resolve(`/images/posts/${filename}`);
        });
        response.on('error', reject);
      }).on('error', reject);
    });
  });
}

// Get property value from Notion page
function getProperty(page, name, type) {
  const prop = page.properties[name];
  if (!prop) return null;
  
  switch (type) {
    case 'title':
      return prop.title?.[0]?.plain_text || '';
    case 'rich_text':
      return prop.rich_text?.[0]?.plain_text || '';
    case 'select':
      return prop.select?.name || '';
    case 'multi_select':
      return prop.multi_select?.map(s => s.name) || [];
    case 'date':
      return prop.date?.start || '';
    default:
      return null;
  }
}

// Convert Notion page to Hugo markdown
async function pageToMarkdown(page) {
  const title = getProperty(page, 'Title', 'title') || getProperty(page, 'Name', 'title');
  const slug = getProperty(page, 'Slug', 'rich_text') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const status = getProperty(page, 'Status', 'select');
  const date = getProperty(page, 'Date', 'date') || page.created_time.split('T')[0];
  const tags = getProperty(page, 'Tags', 'multi_select');
  const summary = getProperty(page, 'Summary', 'rich_text');
  
  // Skip drafts
  if (status && status !== 'Published') {
    console.log(`Skipping draft: ${title}`);
    return null;
  }
  
  // Get markdown content
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  let content = n2m.toMarkdownString(mdBlocks).parent;
  
  // Download and replace images
  let imageIndex = 0;
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const matches = [...content.matchAll(imageRegex)];
  
  for (const match of matches) {
    try {
      const localPath = await downloadImage(match[2], slug, imageIndex++);
      content = content.replace(match[0], `![${match[1]}](${localPath})`);
      console.log(`Downloaded image: ${localPath}`);
    } catch (err) {
      console.warn(`Failed to download image: ${match[2]}`, err.message);
    }
  }
  
  // Build front matter
  const frontMatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `draft: false`,
  ];
  
  if (tags.length > 0) {
    frontMatter.push(`tags: [${tags.map(t => `"${t}"`).join(', ')}]`);
  }
  
  if (summary) {
    frontMatter.push(`summary: "${summary.replace(/"/g, '\\"')}"`);
  }
  
  frontMatter.push('---', '');
  
  return {
    slug,
    content: frontMatter.join('\n') + content
  };
}

// Main sync function
async function sync() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!databaseId) {
    console.error('NOTION_DATABASE_ID not set');
    process.exit(1);
  }
  
  console.log('Fetching pages from Notion...');
  
  // Query database
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' }
    }
  });
  
  console.log(`Found ${response.results.length} published posts`);
  
  // Ensure content directory exists
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  
  // Process each page
  for (const page of response.results) {
    try {
      const result = await pageToMarkdown(page);
      if (result) {
        const filepath = path.join(CONTENT_DIR, `${result.slug}.md`);
        await fs.writeFile(filepath, result.content);
        console.log(`Wrote: ${result.slug}.md`);
      }
    } catch (err) {
      console.error(`Error processing page:`, err);
    }
  }
  
  console.log('Sync complete!');
}

sync().catch(console.error);
```

**Step 3: Verify script syntax**

Run:
```bash
node --check scripts/notion-sync.js
```
Expected: No output (no syntax errors)

---

### Task 4: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/sync-notion.yml`

**Step 1: Create workflows directory**

Run:
```bash
mkdir -p ~/code/michaels-blog/.github/workflows
```

**Step 2: Create workflow file**

Create file `.github/workflows/sync-notion.yml`:

```yaml
name: Sync Notion to Hugo

on:
  # Manual trigger
  workflow_dispatch:
  
  # Scheduled sync every 6 hours
  schedule:
    - cron: '0 */6 * * *'

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Sync from Notion
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
        run: npm run sync
        
      - name: Commit and push if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content/posts/ static/images/
          git diff --staged --quiet || git commit -m "Sync posts from Notion"
          git push
```

---

## Phase 3: GitHub Secrets Setup

### Task 5: Add GitHub Secrets

**Step 1: Go to repository settings**

Open: https://github.com/michaelpersonal/michaels-blog/settings/secrets/actions

**Step 2: Add NOTION_API_KEY**

- Click "New repository secret"
- Name: `NOTION_API_KEY`
- Value: Your Notion integration token (starts with `secret_...`)

**Step 3: Add NOTION_DATABASE_ID**

- Click "New repository secret"
- Name: `NOTION_DATABASE_ID`
- Value: Your database ID (32 character hex string from Notion URL)

---

## Phase 4: Test and Deploy

### Task 6: Local Test

**Step 1: Set environment variables**

Run:
```bash
export NOTION_API_KEY="your-notion-api-key"
export NOTION_DATABASE_ID="your-database-id"
```

**Step 2: Run sync locally**

Run:
```bash
cd ~/code/michaels-blog
npm run sync
```

Expected: Posts from Notion appear in `content/posts/`

**Step 3: Test Hugo build**

Run:
```bash
hugo server -D
```

Open http://localhost:1313 and verify posts appear.

---

### Task 7: Commit and Push

**Step 1: Stage all files**

Run:
```bash
cd ~/code/michaels-blog
git add .
```

**Step 2: Commit**

Run:
```bash
git commit -m "Add Notion sync workflow

- Sync script (scripts/notion-sync.js)
- GitHub Actions workflow (scheduled + manual)
- Package.json with dependencies"
```

**Step 3: Push**

Run:
```bash
git push
```

---

### Task 8: Test GitHub Action

**Step 1: Go to Actions tab**

Open: https://github.com/michaelpersonal/michaels-blog/actions

**Step 2: Manually trigger workflow**

- Click "Sync Notion to Hugo"
- Click "Run workflow" → "Run workflow"

**Step 3: Verify success**

- Workflow should complete successfully
- New commits appear if posts were synced
- Vercel auto-deploys the changes

---

## Summary

After completing all tasks:

| Component | Location |
|-----------|----------|
| Sync script | `scripts/notion-sync.js` |
| GitHub workflow | `.github/workflows/sync-notion.yml` |
| Package config | `package.json` |

**Your new workflow:**
1. Write post in Notion database
2. Set properties (Title, Slug, Tags, Date, Summary)
3. Set Status = "Published"
4. Wait for sync (every 6 hours) or trigger manually
5. Post appears on blog!

---

## Future Enhancements

- [ ] Delete posts removed from Notion
- [ ] Support for Notion callouts → Hugo shortcodes
- [ ] Better image optimization
- [ ] Draft preview environment
