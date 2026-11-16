import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, '_site');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'assets']) {
  await cp(join(root, path), join(output, path), { recursive: true });
}
const index = await readFile(join(output, 'index.html'), 'utf8');
await writeFile(join(output, 'index.html'), index.replace(/(<span id="app-version"[^>]*>)v\d+\.\d+\.\d+(<\/span>)/, `$1v${pkg.version}$2`));
await writeFile(join(output, '.nojekyll'), '');
console.log(`Web Notes v${pkg.version} を _site/ にビルドしました。`);
