/**
 * SEO Audit Script
 *
 * Runs during build to validate content quality and SEO fields.
 * Usage: bun run scripts/seo-audit.ts
 */

interface AuditResult {
  file: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm: Record<string, unknown> = {};
  const lines = match[1].split('\n');
  let currentKey = '';

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let value: unknown = keyMatch[2].trim();
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value.startsWith('[')) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          value = [];
        }
      }
      fm[currentKey] = value;
    }
  }

  return fm;
}

function auditPost(filePath: string, content: string): AuditResult[] {
  const results: AuditResult[] = [];
  const fm = parseFrontmatter(content);
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  if (
    !fm.description ||
    (typeof fm.description === 'string' && fm.description.trim().length === 0)
  ) {
    results.push({
      file: filePath,
      field: 'description',
      message: 'Missing or empty description',
      severity: 'error',
    });
  } else if (typeof fm.description === 'string') {
    const descLen = fm.description.length;
    if (descLen < 50) {
      results.push({
        file: filePath,
        field: 'description',
        message: `Description too short (${descLen} chars, minimum 50)`,
        severity: 'warning',
      });
    }
    if (descLen > 320) {
      results.push({
        file: filePath,
        field: 'description',
        message: `Description too long (${descLen} chars, maximum 320)`,
        severity: 'warning',
      });
    }
  }

  if (!fm.title || (typeof fm.title === 'string' && fm.title.length > 60)) {
    results.push({
      file: filePath,
      field: 'title',
      message: `Title too long (${typeof fm.title === 'string' ? fm.title.length : 0} chars, maximum 60)`,
      severity: 'warning',
    });
  }

  if (
    fm.cover &&
    (!fm.coverAlt || (typeof fm.coverAlt === 'string' && fm.coverAlt.trim().length === 0))
  ) {
    results.push({
      file: filePath,
      field: 'coverAlt',
      message: 'Cover image missing alt text',
      severity: 'error',
    });
  }

  if (!fm.keywords || (Array.isArray(fm.keywords) && fm.keywords.length === 0)) {
    results.push({
      file: filePath,
      field: 'keywords',
      message: 'Missing keywords field',
      severity: 'info',
    });
  }

  if (wordCount < 100) {
    results.push({
      file: filePath,
      field: 'body',
      message: `Thin content — only ${wordCount} words (minimum 100)`,
      severity: 'warning',
    });
  }

  if (!fm.author || (typeof fm.author === 'string' && fm.author.trim().length === 0)) {
    results.push({
      file: filePath,
      field: 'author',
      message: 'Missing author',
      severity: 'error',
    });
  }

  if (!fm.category || (typeof fm.category === 'string' && fm.category.trim().length === 0)) {
    results.push({
      file: filePath,
      field: 'category',
      message: 'Missing category',
      severity: 'warning',
    });
  }

  if (!fm.tags || (Array.isArray(fm.tags) && fm.tags.length === 0)) {
    results.push({
      file: filePath,
      field: 'tags',
      message: 'Missing tags',
      severity: 'info',
    });
  }

  return results;
}

async function main() {
  const { readdirSync, readFileSync: readFs } = await import('node:fs');
  const { join, resolve } = await import('node:path');

  const blogDir = resolve(process.cwd(), 'src/content/blog');

  let files: string[];
  try {
    files = readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  } catch {
    console.error('Could not read blog directory:', blogDir);
    process.exit(1);
  }

  const allResults: AuditResult[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const file of files) {
    const filePath = join(blogDir, file);
    const content = readFs(filePath, 'utf-8');
    const results = auditPost(`src/content/blog/${file}`, content);
    allResults.push(...results);

    const fm = parseFrontmatter(content);
    if (typeof fm.title === 'string') {
      const normalized = fm.title.toLowerCase().trim();
      if (titles.has(normalized)) {
        allResults.push({
          file: `src/content/blog/${file}`,
          field: 'title',
          message: `Duplicate title (also in ${titles.get(normalized)})`,
          severity: 'error',
        });
      }
      titles.set(normalized, file);
    }

    if (typeof fm.description === 'string') {
      const normalized = fm.description.toLowerCase().trim();
      if (descriptions.has(normalized)) {
        allResults.push({
          file: `src/content/blog/${file}`,
          field: 'description',
          message: `Duplicate description (also in ${descriptions.get(normalized)})`,
          severity: 'warning',
        });
      }
      descriptions.set(normalized, file);
    }
  }

  const errors = allResults.filter((r) => r.severity === 'error');
  const warnings = allResults.filter((r) => r.severity === 'warning');
  const infos = allResults.filter((r) => r.severity === 'info');

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║        SEO AUDIT REPORT                 ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log(`📄 Files scanned: ${files.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`ℹ️  Info: ${infos.length}\n`);

  if (errors.length > 0) {
    console.log('── ERRORS ─────────────────────────────────');
    for (const r of errors) {
      console.log(`  ✗ ${r.file}`);
      console.log(`    ${r.field}: ${r.message}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('── WARNINGS ───────────────────────────────');
    for (const r of warnings) {
      console.log(`  ⚠ ${r.file}`);
      console.log(`    ${r.field}: ${r.message}`);
    }
    console.log('');
  }

  if (infos.length > 0) {
    console.log('── INFO ───────────────────────────────────');
    for (const r of infos) {
      console.log(`  ℹ ${r.file}`);
      console.log(`    ${r.field}: ${r.message}`);
    }
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0 && infos.length === 0) {
    console.log('✅ All checks passed!\n');
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
