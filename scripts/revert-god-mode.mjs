import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.feature-backups/god-mode/patches.json'),'utf8'));
const target=path.join(root,manifest.target);
let source=fs.readFileSync(target,'utf8');
for(const {before,after} of [...manifest.patches].reverse()){
  if(!source.includes(after)||source.indexOf(after)!==source.lastIndexOf(after))throw Error('Cannot safely reverse a modified God Mode integration. Inspect the patch manifest; do not restore the whole snapshot over unrelated changes.');
  source=source.replace(after,before);
}
if(!process.argv.includes('--apply')){console.log('God Mode can be selectively reverted. No files changed. Run with --apply only when a revert is requested.');process.exit(0);}
fs.writeFileSync(target,source);
for(const relative of manifest.featureFiles){const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw Error('Feature path escaped the workspace');if(fs.existsSync(file))fs.unlinkSync(file);}
console.log('Reverted only God Mode. Existing timer fixes, match analytics, history, sounds, themes, and companion hand tracking remain.');
