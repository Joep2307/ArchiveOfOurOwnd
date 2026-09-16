import { readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Manages the to-dos in `TODO/`. Each to-do is one file named
 * `TODO <n> (<status>).md`, so the status shows in the file list.
 *
 *   pnpm todo list
 *   pnpm todo add "Title" ["Details"]
 *   pnpm todo doing <n>
 *   pnpm todo done <n>
 *   pnpm todo open <n>
 */
const DIR = 'TODO';
const STATUSES = {
    open: 'Not done yet',
    doing: 'Doing',
    done: 'Done',
} as const;
const PATTERN = /^TODO (\d+) \((Not done yet|Doing|Done)\)\.md$/u;

const todos = readdirSync(DIR).flatMap((file) => {
    const match = PATTERN.exec(file);
    return match ? [{ file, n: Number(match[1]), status: match[2] }] : [];
});
todos.sort((a, b) => a.n - b.n);

const [command = 'list', ...args] = process.argv.slice(2);

if (command === 'list') {
    for (const todo of todos) {
        const title = readFileSync(join(DIR, todo.file), 'utf8')
            .split('\n')[0]
            ?.replace(/^#\s*/u, '');
        console.log(`TODO ${todo.n} (${todo.status}) ${title ?? ''}`);
    }
} else if (command === 'add') {
    const [title, details = ''] = args;
    if (!title) throw new Error('Usage: pnpm todo add "Title" ["Details"]');
    const n = Math.max(0, ...todos.map((todo) => todo.n)) + 1;
    const file = `TODO ${n} (${STATUSES.open}).md`;
    const body = `# ${title}\n\n${details}`.trimEnd();
    writeFileSync(join(DIR, file), `${body}\n`);
    console.log(`Added ${file}`);
} else if (command in STATUSES) {
    const n = Number(args[0]);
    const todo = todos.find((item) => item.n === n);
    if (!todo) throw new Error(`No TODO ${args[0] ?? ''} in ${DIR}/`);
    const status = STATUSES[command as keyof typeof STATUSES];
    const file = `TODO ${n} (${status}).md`;
    renameSync(join(DIR, todo.file), join(DIR, file));
    console.log(`${todo.file} -> ${file}`);
} else {
    throw new Error(`Unknown command "${command}"`);
}
