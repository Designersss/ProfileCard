import { GifEncoder } from './gif.js';
let encoder;
self.onmessage=async ({data})=>{
 try{
  if(data.type==='start') {encoder=new GifEncoder(data.width,data.height,{delay:data.delay});self.postMessage({type:'ready'});}
  if(data.type==='frame') {if(!encoder)throw Error('GIF export not initialized');encoder.addFrame(new Uint8ClampedArray(data.buffer));self.postMessage({type:'ready'});}
  if(data.type==='finish') {const blob=encoder.finish();encoder=null;self.postMessage({type:'done',blob});}
 }catch(error){self.postMessage({type:'error',message:error.message||'GIF encoding failed'});}
};
