import gen from './gen.mjs';
import { join as desm } from 'desm';
import { readFileSync as rf, existsSync as ex } from 'node:fs';

const file = desm(import.meta.url, 'codes.json');

if (!ex()) await gen();
const keys = JSON.parse(rf(file), 'utf8');

function fromCode(code) {
    const ix = Object.values(keys).indexOf(code);
    return ix >= 0 ? Object.keys(keys)[ix] : undefined;
}

export { keys, fromCode, gen };
