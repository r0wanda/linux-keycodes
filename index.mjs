import { join as desm } from 'desm';
import { readFileSync as rf } from 'node:fs';

const keys = JSON.parse(rf(desm(import.meta.url, 'codes.json'), 'utf8'));

function fromCode(code) {
    const ix = Object.values(keys).indexOf(code);
    return ix >= 0 ? Object.keys(keys)[ix] : undefined;
}

export { keys, fromCode };
export { default as gen } from './gen.mjs';
