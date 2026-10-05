const fs = require('node:fs');

const [midiPath, manifestPath] = process.argv.slice(2);
if (!midiPath || !manifestPath) {
  console.error('Usage: node scripts/check-midi-events.js <file.mid> <manifest.json>');
  process.exit(2);
}

const bytes = fs.readFileSync(midiPath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function readVariableLength(buffer, index) {
  let value = 0;
  let position = index;
  do {
    if (position >= buffer.length) throw new Error('Unexpected end of variable-length MIDI value.');
    value = (value << 7) | (buffer[position] & 0x7f);
  } while (buffer[position++] & 0x80);
  return { value, next: position };
}

if (bytes.subarray(0, 4).toString('ascii') !== 'MThd') {
  throw new Error('Input is not a Standard MIDI file: missing MThd header.');
}

let offset = 14;
let noteOnEvents = 0;
while (offset < bytes.length) {
  if (bytes.subarray(offset, offset + 4).toString('ascii') !== 'MTrk') {
    throw new Error(`Expected MTrk at byte ${offset}.`);
  }
  const length = bytes.readUInt32BE(offset + 4);
  const end = offset + 8 + length;
  let position = offset + 8;
  let runningStatus = 0;
  while (position < end) {
    position = readVariableLength(bytes, position).next;
    let status = bytes[position];
    if (status < 0x80) {
      status = runningStatus;
    } else {
      position += 1;
      if (status < 0xf0) runningStatus = status;
    }
    if (status === 0xff) {
      position += 1;
      const metaLength = readVariableLength(bytes, position);
      position = metaLength.next + metaLength.value;
      continue;
    }
    const type = status & 0xf0;
    if (type === 0x90 || type === 0x80 || type === 0xa0 || type === 0xb0 || type === 0xe0) {
      const note = bytes[position++];
      const velocity = bytes[position++];
      if (type === 0x90 && velocity > 0) noteOnEvents += 1;
      continue;
    }
    if (type === 0xc0 || type === 0xd0) {
      position += 1;
      continue;
    }
    throw new Error(`Unsupported MIDI event status 0x${status.toString(16)}.`);
  }
  offset = end;
}

const expected = manifest.output.expectedNoteOnEvents;
if (noteOnEvents !== expected) {
  console.error(`FAIL: found ${noteOnEvents} note-on events; expected ${expected}.`);
  process.exit(1);
}
console.log(`PASS: found ${noteOnEvents} note-on events; expected ${expected}.`);
