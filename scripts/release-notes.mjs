import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function writeReleaseNotes(root, output) {
  const path = join('assets', 'release-notes.json');
  const saved = JSON.parse(await readFile(join(root, path), 'utf8'));
  if (!existsSync(join(root, '.git'))) return;

  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const byCommit = new Map(saved.map(note => [note.commit, note]));
  const history = git(['log', '--first-parent', '--format=%H%x00%cI%x00%s', 'HEAD']).trimEnd();
  const notes = history.split('\n').flatMap(line => {
    const [commit, date, subject] = line.split('\0');
    const note = byCommit.get(commit);
    if (note) return [note];

    if (!git(['ls-tree', '--name-only', commit, '--', 'package.json']).trim()) return [];
    const { version } = JSON.parse(git(['show', `${commit}:package.json`]));
    return [{ date, version, changes: subject, commit }];
  });

  await writeFile(join(output, path), JSON.stringify(notes, null, 2) + '\n');
}
