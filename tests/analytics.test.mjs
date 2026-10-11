import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const worker=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('Cloudflare Web Analytics beacon is configured exactly once on page load',()=>{
  assert.equal(html.split('https://static.cloudflareinsights.com/beacon.min.js').length-1,1);
  assert.match(html,/type="module" src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"/);
  assert.match(html,/data-cf-beacon='\{"token": "3ee5bf52c6904c8988edcf1e97848a3f"\}'/);
});
test('analytics stays outside offline cache and photo-only interface reflects local data storage',()=>{
  assert.doesNotMatch(worker,/cloudflareinsights|beacon\.min/);
  assert.match(html,/Photos and profile stay on this device/);
});
