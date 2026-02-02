const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

// Config
const CONTENT_DIR = path.join(__dirname, 'content', 'posts');
const OUTPUT_DIR = path.join(__dirname, 'posts');
const TEMPLATE_PATH = path.join(__dirname, 'posts', 'template.html');

async function build() {
    console.log('🚀 Starting build...');

    // 1. Ensure content dir exists
    await fs.ensureDir(CONTENT_DIR);

    // 2. Read template
    let template = await fs.readFile(TEMPLATE_PATH, 'utf-8');

    // 3. Get all Markdown files
    const files = await fs.readdir(CONTENT_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`Found ${mdFiles.length} markdown files.`);

    for (const file of mdFiles) {
        const rawContent = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
        const { data, content } = matter(rawContent);

        // Convert Markdown to HTML
        const htmlContent = marked.parse(content);

        // Inject into template
        let pageHtml = template;

        // Robust replacements
        pageHtml = pageHtml.replace('{{TITLE}}', data.title || 'Untitled Post');
        pageHtml = pageHtml.replace('{{DATE}}', data.date || 'TODAY');
        pageHtml = pageHtml.replace('{{CATEGORY}}', (data.category || 'GENERAL').toUpperCase());
        pageHtml = pageHtml.replace('{{CONTENT}}', htmlContent);

        // Save
        const outputFilename = file.replace('.md', '.html');
        await fs.outputFile(path.join(OUTPUT_DIR, outputFilename), pageHtml);
        console.log(`✅ Generated: ${outputFilename}`);
    }
    console.log('🎉 Build complete!');
}

build().catch(console.error);
