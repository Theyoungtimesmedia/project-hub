export type ZipInput = { name: string; bytes: Uint8Array };

const encoder = new TextEncoder();
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let value = n;
    for (let k = 0; k < 8; k++) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    table[n] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}
function header(size: number, signature: number) {
  const bytes = new Uint8Array(size);
  new DataView(bytes.buffer).setUint32(0, signature, true);
  return bytes;
}
function put16(view: DataView, offset: number, value: number) { view.setUint16(offset, value, true); }
function put32(view: DataView, offset: number, value: number) { view.setUint32(offset, value >>> 0, true); }

export function createZip(inputs: ZipInput[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;
  for (const file of inputs) {
    const name = encoder.encode(file.name.replaceAll("\\", "/"));
    const data = file.bytes;
    const crc = crc32(data);
    const local = header(30 + name.length, 0x04034b50);
    const lv = new DataView(local.buffer);
    put16(lv, 4, 20); put16(lv, 6, 0x0800); put16(lv, 8, 0);
    put16(lv, 10, 0); put16(lv, 12, 0);
    put32(lv, 14, crc); put32(lv, 18, data.length); put32(lv, 22, data.length);
    put16(lv, 26, name.length); put16(lv, 28, 0);
    local.set(name, 30);
    localParts.push(local, data);

    const central = header(46 + name.length, 0x02014b50);
    const cv = new DataView(central.buffer);
    put16(cv, 4, 20); put16(cv, 6, 20); put16(cv, 8, 0x0800); put16(cv, 10, 0);
    put16(cv, 12, 0); put16(cv, 14, 0);
    put32(cv, 16, crc); put32(cv, 20, data.length); put32(cv, 24, data.length);
    put16(cv, 28, name.length); put16(cv, 30, 0); put16(cv, 32, 0);
    put16(cv, 34, 0); put16(cv, 36, 0); put32(cv, 38, 0); put32(cv, 42, localOffset);
    central.set(name, 46);
    centralParts.push(central);
    localOffset += local.length + data.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = header(22, 0x06054b50);
  const ev = new DataView(end.buffer);
  put16(ev, 4, 0); put16(ev, 6, 0); put16(ev, 8, inputs.length); put16(ev, 10, inputs.length);
  put32(ev, 12, centralSize); put32(ev, 16, localOffset); put16(ev, 20, 0);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}
