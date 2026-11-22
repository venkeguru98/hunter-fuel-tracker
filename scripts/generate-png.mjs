import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal CRC32 implementation
function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(size) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((width * 4 + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.46;
  const rDial = width * 0.38;
  const rCore = width * 0.28;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx); // -PI to +PI

      let r = 12, g = 14, b = 18, a = 255; // Graphite-950 base

      // Outer bezel ring
      if (dist < rOuter && dist >= rOuter - 6) {
        r = 60; g = 70; b = 85;
      } else if (dist < rDial && dist >= rDial - 8) {
        // Neon Lime speedometer arc (top portion: from 140deg to 380deg)
        if (angle < 0.8 || angle > 2.3) {
          r = 154; g = 230; b = 0; // #9ae600 Lime
        } else {
          r = 40; g = 48; b = 60;
        }
      } else if (dist < rDial - 8 && dist >= rCore) {
        // Dial carbon surface
        const checker = ((Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0);
        r = checker ? 24 : 18;
        g = checker ? 28 : 22;
        b = checker ? 36 : 28;
      } else if (dist < rCore) {
        // Inner digital display
        r = 14; g = 17; b = 23;
        // Amber dot near bottom
        if (dy > rCore * 0.4 && Math.abs(dx) < 6) {
          r = 245; g = 158; b = 11; // Amber fuel glow
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public/icons');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512));
console.log('Successfully generated valid PNG icons: icon-192.png and icon-512.png');
