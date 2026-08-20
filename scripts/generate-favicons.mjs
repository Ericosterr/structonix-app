import { Jimp, intToRGBA } from "jimp";
import toIco from "to-ico";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SOURCE = join(ROOT, "public/logo/StructonixLogoWhite.jpg");
const OUT_DIR = join(ROOT, "public");

const BRAND = { r: 2, g: 33, b: 82, a: 255 };
const WHITE_THRESHOLD = 48;
const CONTENT_MARGIN_RATIO = 0.04;
const ICON_PADDING_RATIO = 0.1;

function findContentBounds(image) {
  const { width, height } = image.bitmap;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { r, g, b } = intToRGBA(image.getPixelColor(x, y));
      if (r > WHITE_THRESHOLD || g > WHITE_THRESHOLD || b > WHITE_THRESHOLD) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    throw new Error("Could not detect logo bounds in source image.");
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  const margin = Math.round(Math.max(contentWidth, contentHeight) * CONTENT_MARGIN_RATIO);

  return {
    x: Math.max(0, minX - margin),
    y: Math.max(0, minY - margin),
    w: Math.min(width, contentWidth + margin * 2),
    h: Math.min(height, contentHeight + margin * 2),
  };
}

async function createSquareIcon(source, size) {
  const bounds = findContentBounds(source);
  const cropped = source.clone().crop({ x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h });

  const side = Math.max(cropped.bitmap.width, cropped.bitmap.height);
  const square = new Jimp({ width: side, height: side, color: BRAND });

  const offsetX = Math.floor((side - cropped.bitmap.width) / 2);
  const offsetY = Math.floor((side - cropped.bitmap.height) / 2);
  square.composite(cropped, offsetX, offsetY);

  const paddedSize = Math.round(size * (1 - ICON_PADDING_RATIO * 2));
  const mark = square.clone().resize({ w: paddedSize, h: paddedSize });
  const icon = new Jimp({ width: size, height: size, color: BRAND });
  const inset = Math.floor((size - paddedSize) / 2);
  icon.composite(mark, inset, inset);

  return icon;
}

async function main() {
  const source = await Jimp.read(SOURCE);

  const outputs = [
    { file: "icon-48x48.png", size: 48 },
    { file: "icon-96x96.png", size: 96 },
    { file: "icon-192x192.png", size: 192 },
    { file: "apple-icon.png", size: 180 },
  ];

  const pngBuffers = [];

  for (const { file, size } of outputs) {
    const icon = await createSquareIcon(source, size);
    const buffer = await icon.getBuffer("image/png");
    writeFileSync(join(OUT_DIR, file), buffer);
    console.log(`Wrote ${file} (${size}x${size})`);
  }

  for (const size of [16, 32, 48]) {
    const icon = await createSquareIcon(source, size);
    pngBuffers.push(await icon.getBuffer("image/png"));
  }

  writeFileSync(join(OUT_DIR, "favicon.ico"), await toIco(pngBuffers));
  console.log("Wrote favicon.ico (16, 32, 48)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
