/** Small offline GIF89a encoder, 256-color RGB332 palette and LZW compression.
 * Operates in a Web Worker so large exports never block the editor's UI thread.
 * GIF is necessarily 256-color; ordered dithering limits gradient banding. */
const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const pushShort=(out,n)=>{out.push(n&255,(n>>8)&255);};
const rgb332 = () => {
  const entries=[];
  for(let i=0;i<256;i++) entries.push(Math.round(((i>>5)&7)*255/7),Math.round(((i>>2)&7)*255/7),Math.round((i&3)*255/3));
  return entries;
};
function quantize(rgba,width,height) {
  if(!rgba || rgba.length!==width*height*4) throw Error('Invalid frame pixels');
  const out=new Uint8Array(width*height);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){
    const n=y*width+x,i=n*4;
    const threshold=(bayer[(y&3)*4+(x&3)]-7.5)*1.2;
    const r=Math.min(255,Math.max(0,rgba[i]+threshold));
    const g=Math.min(255,Math.max(0,rgba[i+1]+threshold));
    const b=Math.min(255,Math.max(0,rgba[i+2]+threshold));
    out[n]=((Math.round(r*7/255)&7)<<5)|((Math.round(g*7/255)&7)<<2)|(Math.round(b*3/255)&3);
  }
  return out;
}
function lzw(pixels) {
  const CLEAR=256,END=257;
  let dictionary=new Map(),next=258,size=9;
  const bytes=[];
  let bits=0,bitCount=0;
  const write=(code)=>{bits|=code<<bitCount;bitCount+=size;while(bitCount>=8){bytes.push(bits&255);bits>>>=8;bitCount-=8;}};
  write(CLEAR);
  if(!pixels.length){write(END);return Uint8Array.from(bytes);}
  let prefix=pixels[0];
  for(let i=1;i<pixels.length;i++){
    const index=pixels[i],key=prefix*256+index;
    const found=dictionary.get(key);
    if(found!==undefined){prefix=found;continue;}
    write(prefix);
    if(next<4096){
      dictionary.set(key,next++);
      if(next===(1<<size)+1 && size<12) size++; // encoder/decoder dictionary stays synchronized
    }else{
      write(CLEAR);dictionary=new Map();next=258;size=9;
    }
    prefix=index;
  }
  write(prefix);write(END);
  if(bitCount>0)bytes.push(bits&255);
  return Uint8Array.from(bytes);
}
export class GifEncoder {
  constructor(width,height,{delay=10}={}) {
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>1000||height>1000)throw Error('Invalid GIF dimensions');
    this.width=width;this.height=height;this.delay=Math.max(2,Math.min(1000,Math.round(delay)));
    this.parts=[];this.frames=0;
    const header=[...new TextEncoder().encode('GIF89a')];
    pushShort(header,width);pushShort(header,height);
    header.push(0xF7,0,0,...rgb332());
    // NETSCAPE2.0 infinite loop extension.
    header.push(0x21,0xFF,11,...new TextEncoder().encode('NETSCAPE2.0'),3,1,0,0,0);
    this.parts.push(Uint8Array.from(header));
  }
  addFrame(rgba) {
    if(this.frames>=80)throw Error('GIF frame limit exceeded');
    const indices=quantize(rgba,this.width,this.height);
    const data=lzw(indices);
    const prefix=[0x21,0xF9,4,0x08];
    pushShort(prefix,this.delay);prefix.push(0,0,0x2C);
    pushShort(prefix,0);pushShort(prefix,0);pushShort(prefix,this.width);pushShort(prefix,this.height);
    prefix.push(0,8);
    this.parts.push(Uint8Array.from(prefix));
    for(let i=0;i<data.length;i+=255){const chunk=data.subarray(i,i+255);this.parts.push(Uint8Array.from([chunk.length]));this.parts.push(chunk);}
    this.parts.push(Uint8Array.of(0));this.frames++;
  }
  finish(){if(!this.frames)throw Error('No frames added');return new Blob([...this.parts,Uint8Array.of(0x3B)],{type:'image/gif'});}
}
