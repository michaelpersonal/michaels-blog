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
