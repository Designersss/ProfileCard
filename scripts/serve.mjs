import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const port=Number(process.env.PORT)||4173;
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,`http://localhost:${port}`).pathname);
  const file=resolve(root,'.'+pathname,(pathname.endsWith('/')?'index.html':''));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
  if((await stat(file)).isDirectory()){res.writeHead(404);res.end('Not found');return;}
  const data=await readFile(file);
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-cache');
  res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,()=>console.log(`ProfileCard: http://localhost:${port}`));
