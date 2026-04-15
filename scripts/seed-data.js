import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportsPath = path.join(repoRoot, 'backend', 'data', 'community_reports.json');

await fs.mkdir(path.dirname(reportsPath), { recursive: true });
await fs.writeFile(reportsPath, '[]\n', 'utf8');

console.log(`Reset local community report store at ${reportsPath}`);
