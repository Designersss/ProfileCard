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

// Photo-only releases must not accidentally ship the retired character builder.
const app=await readFile(join(root,'src/app.js'),'utf8');
const card=await readFile(join(root,'src/card.js'),'utf8');
const html=await readFile(join(root,'index.html'),'utf8');
if(files.some(f=>f.endsWith('/src/characters.js')))throw Error('Legacy character art must not ship.');
for(const [name,content] of [['app',app],['card',card],['html',html]]){
 if(/(?:randomizeCharacter|characterSVG|characterBuilder|avatarMode|tabCharacter)/.test(content))throw Error(`Legacy character reference in ${name}`);
}
if(!html.includes('id="tabPhoto"')||!html.includes('id="photoUpload"'))throw Error('Photo-only UI is missing.');
if(sw.includes('src/characters.js'))throw Error('PWA still caches deleted character art.');
