import gen from './gen.js';
import { join as desm } from 'desm';
import { readFileSync as rf, existsSync as ex } from 'node:fs';

const file = desm(import.meta.url, 'codes.json');

if (!ex(file)) await gen();
const keys: Codes = JSON.parse(rf(file, 'utf8'));

function fromCode(code: string) {
    return keys[code];
}

export { keys, fromCode, gen };
