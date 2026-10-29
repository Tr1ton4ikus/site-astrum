// Собирает content/index.json из front matter всех статей в content/*.md.
// Запуск: node wiki/build.mjs  (в GitHub Actions запускается автоматически при каждом сохранении статьи в редакторе)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'content');
const pages = readdirSync(dir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const src = readFileSync(join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    const m = src.match(/^---\n([\s\S]*?)\n---/);
    const meta = {};
    if (m) for (const line of m[1].split('\n')) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
    return {
      slug: f.replace(/\.md$/, ''),
      title: meta.title || f,
      group: meta.group || 'Разное',
      order: Number(meta.order) || 999,
    };
  })
  .sort((a, b) => a.order - b.order);

writeFileSync(join(dir, 'index.json'), JSON.stringify(pages, null, 2) + '\n');
console.log(`Вики: ${pages.length} статей → content/index.json`);

// node wiki/build.mjs --watch — пересобирать список при каждом сохранении статьи (удобно вместе с локальным редактором)
if (process.argv.includes('--watch')) {
  const { watch } = await import('node:fs');
  let t;
  watch(dir, (_, f) => { if (f && f.endsWith('.md')) { clearTimeout(t); t = setTimeout(() => import('node:child_process').then(c => c.execFileSync(process.execPath, [fileURLToPath(import.meta.url)], { stdio: 'inherit' })), 200); } });
  console.log('Слежу за wiki/content …');
}
