/**
 * Generate Structonix Global favicon assets from the official mark.
 *
 * Source: blue square "S" mark on a dark/black field.
 * Output: transparent-background icons with ~70% logo occupancy so the
 * outer square frame stays inside Google's circular favicon safe area.
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "public/logo/StructonixGlobalLogo-favicon.png");
const PUBLIC_DIR = join(ROOT, "public");
const APP_DIR = join(ROOT, "src/app");

/** Logo occupies this fraction of the canvas (Google circular safe area). */
const LOGO_RATIO = 0.68;
/** Near-black pixels at or below this luminance become transparent. */
const BLACK_LUMA_MAX = 28;

/**
 * Build a Windows ICO container that embeds PNG payloads (Vista+ format).
 */
function pngBuffersToIco(pngBuffers) {
  if (!Array.isArray(pngBuffers) || pngBuffers.length === 0) {
    throw new Error("pngBuffersToIco requires at least one PNG buffer.");
  }

  const images = pngBuffers.map((buffer, index) => {
    if (!Buffer.isBuffer(buffer) || buffer.length < 24) {
      throw new Error(`PNG buffer #${index} is empty or too short.`);
    }
    if (
      buffer[0] !== 0x89 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x4e ||
      buffer[3] !== 0x47
    ) {
      throw new Error(`PNG buffer #${index} is not a valid PNG.`);
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width < 1 || height < 1 || width > 256 || height > 256) {
      throw new Error(
        `PNG buffer #${index} has unsupported size ${width}x${height}.`,
      );
    }

    return { buffer, width, height };
  });

  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * images.length;
  const totalSize =
    dataOffset + images.reduce((sum, image) => sum + image.buffer.length, 0);
  const ico = Buffer.alloc(totalSize);

  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(images.length, 4);

  let offset = dataOffset;
  images.forEach((image, index) => {
    const entryOffset = headerSize + index * entrySize;
    ico.writeUInt8(image.width === 256 ? 0 : image.width, entryOffset);
    ico.writeUInt8(image.height === 256 ? 0 : image.height, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2);
    ico.writeUInt8(0, entryOffset + 3);
    ico.writeUInt16LE(1, entryOffset + 4);
    ico.writeUInt16LE(32, entryOffset + 6);
    ico.writeUInt32LE(image.buffer.length, entryOffset + 8);
    ico.writeUInt32LE(offset, entryOffset + 12);
    image.buffer.copy(ico, offset);
    offset += image.buffer.length;
  });

  return ico;
}

function findOpaqueBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 16) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error("Could not detect logo bounds after transparency pass.");
  }

  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function extractTransparentMark() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (channels !== 4) {
    throw new Error(`Expected RGBA source, got ${channels} channels.`);
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Drop near-black canvas; keep the blue mark intact.
    if (luma <= BLACK_LUMA_MAX && r < 40 && g < 40 && b < 60) {
      data[i + 3] = 0;
    }
  }

  const bounds = findOpaqueBounds(data, width, height);
  const markSide = Math.max(bounds.width, bounds.height);

  const cropped = await sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .extract(bounds)
    .png()
    .toBuffer();

  // Square transparent canvas for the cropped mark before final padding.
  const squareMark = await sharp({
    create: {
      width: markSide,
      height: markSide,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: cropped,
        left: Math.floor((markSide - bounds.width) / 2),
        top: Math.floor((markSide - bounds.height) / 2),
      },
    ])
    .png()
    .toBuffer();

  return { mark: squareMark, markSide, bounds };
}

async function renderIcon(mark, size) {
  // Keep the logo square inside the inscribed circle: side <= size / √2.
  // Also force even padding on all sides so centering stays symmetric.
  const maxForCircle = Math.floor(size / Math.SQRT2);
  let logoPx = Math.min(Math.round(size * LOGO_RATIO), maxForCircle);
  if ((size - logoPx) % 2 !== 0) logoPx -= 1;
  if (logoPx < 1) logoPx = size % 2 === 0 ? 2 : 1;
  const inset = (size - logoPx) / 2;

  const resizedMark = await sharp(mark)
    .resize(logoPx, logoPx, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resizedMark, left: inset, top: inset }])
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toBuffer();
}

async function writePng(path, buffer) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
  const meta = await sharp(buffer).metadata();
  console.log(
    `Wrote ${path.replace(ROOT + "/", "")} — ${meta.width}x${meta.height} PNG, ${buffer.length} bytes, alpha=${meta.hasAlpha}`,
  );
}

async function main() {
  const { mark, bounds } = await extractTransparentMark();
  console.log(
    `Source mark bounds: ${bounds.width}x${bounds.height} → logo ratio ${LOGO_RATIO * 100}%`,
  );

  const sizes = {
    16: await renderIcon(mark, 16),
    32: await renderIcon(mark, 32),
    48: await renderIcon(mark, 48),
    180: await renderIcon(mark, 180),
    192: await renderIcon(mark, 192),
    512: await renderIcon(mark, 512),
  };

  await writePng(join(APP_DIR, "icon.png"), sizes[512]);
  await writePng(join(APP_DIR, "apple-icon.png"), sizes[180]);
  await writePng(join(PUBLIC_DIR, "apple-touch-icon.png"), sizes[180]);
  await writePng(join(PUBLIC_DIR, "icon-192x192.png"), sizes[192]);
  await writePng(join(PUBLIC_DIR, "icon-512x512.png"), sizes[512]);

  // Keep small public PNGs for explicit metadata / tooling.
  await writePng(join(PUBLIC_DIR, "icon-48x48.png"), sizes[48]);
  await writePng(join(PUBLIC_DIR, "icon-32x32.png"), sizes[32]);

  const ico = pngBuffersToIco([sizes[16], sizes[32], sizes[48]]);
  writeFileSync(join(PUBLIC_DIR, "favicon.ico"), ico);
  console.log(`Wrote public/favicon.ico (16/32/48) — ${ico.length} bytes`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
