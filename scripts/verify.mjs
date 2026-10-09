import {readFile,readdir,stat} from 'node:fs/promises';
import {join,resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
async function walk(dir){return (await Promise.all((await readdir(dir)).map(async name=>{const path=join(dir,name);return (await stat(path)).isDirectory()?walk(path):[path]}))).flat();}
const files=await walk(root);
for(const f of files.filter(file=>extname(file)==='.js'||extname(file)==='.mjs'))execFileSync(process.execPath,['--check',f]);
const manifest=JSON.parse(await readFile(join(root,'manifest.webmanifest'),'utf8'));
const required=['index.html','styles.css','sw.js',...manifest.icons.map(icon=>icon.src.replace(/^\.\//,''))];
for(const name of required)if(!files.includes(join(root,name)))throw Error(`Missing PWA resource: ${name}`);
const sw=await readFile(join(root,'sw.js'),'utf8');
if(!sw.includes('cache.addAll(SHELL)'))throw Error('Missing offline cache prewarming');
console.log(`Verified ${files.length} files: syntax, PWA manifest and offline resources.`);
