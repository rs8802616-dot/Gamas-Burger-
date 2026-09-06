const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node PNG generator
function createPNG(width, height, drawFn) {
  // RGBA buffer
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crc = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeAndData, crcBuf]);
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Burger icon drawer with burger shape and colors
function burgerPixelShader(x, y, w, h, isMaskable = false) {
  const normX = x / w;
  const normY = y / h;

  // Background
  const darkR = 15, darkG = 15, darkB = 18;
  const bgAmberR = 245, bgAmberG = 158, bgAmberB = 11;

  // Safe zone for maskable icons
  const scale = isMaskable ? 0.75 : 0.88;
  const cx = 0.5, cy = 0.5;
  const px = (normX - cx) / scale + cx;
  const py = (normY - cy) / scale + cy;

  // Distance from center
  const dx = px - 0.5;
  const dy = py - 0.5;

  // Top Bun: Ellipse roughly py in [0.25, 0.45], px in [0.2, 0.8]
  if (py >= 0.23 && py <= 0.45) {
    const bunYDist = (py - 0.45) / 0.22;
    const bunXDist = dx / 0.33;
    if (bunXDist * bunXDist + bunYDist * bunYDist <= 1.0) {
      return [bgAmberR, bgAmberG, bgAmberB, 255]; // Bun Amber
    }
  }

  // Lettuce: py in [0.45, 0.49], px in [0.18, 0.82]
  if (py >= 0.44 && py <= 0.49 && Math.abs(dx) <= 0.36) {
    return [34, 197, 94, 255]; // Crisp green
  }

  // Tomato slice: py in [0.49, 0.54], px in [0.22, 0.78]
  if (py >= 0.49 && py <= 0.54 && Math.abs(dx) <= 0.33) {
    return [239, 68, 68, 255]; // Tomato red
  }

  // Cheddar cheese drip: py in [0.54, 0.60]
  if (py >= 0.54 && py <= 0.60 && Math.abs(dx) <= 0.34) {
    return [250, 204, 21, 255]; // Cheddar yellow
  }

  // Meat patty: py in [0.59, 0.69], px in [0.18, 0.82]
  if (py >= 0.59 && py <= 0.69 && Math.abs(dx) <= 0.35) {
    return [115, 45, 12, 255]; // Patty Brown
  }

  // Bottom bun: py in [0.69, 0.78], px in [0.22, 0.78]
  if (py >= 0.69 && py <= 0.78) {
    const bBunY = (py - 0.69) / 0.09;
    const bBunX = dx / 0.32;
    if (bBunX * bBunX + bBunY * bBunY <= 1.0) {
      return [bgAmberR, bgAmberG, bgAmberB, 255];
    }
  }

  // Default App background
  return [darkR, darkG, darkB, 255];
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
console.log('Generating pwa-192x192.png...');
const pwa192 = createPNG(192, 192, (x, y, w, h) => burgerPixelShader(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 512x512
console.log('Generating pwa-512x512.png...');
const pwa512 = createPNG(512, 512, (x, y, w, h) => burgerPixelShader(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// Maskable 512x512 (extra padding)
console.log('Generating pwa-maskable-512x512.png...');
const pwaMaskable = createPNG(512, 512, (x, y, w, h) => burgerPixelShader(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// Apple Touch Icon 180x180
console.log('Generating apple-touch-icon.png...');
const appleTouch = createPNG(180, 180, (x, y, w, h) => burgerPixelShader(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

console.log('All PWA PNG icons generated successfully!');
