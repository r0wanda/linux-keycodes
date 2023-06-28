import { keys, fromCode, gen } from './index.mjs';

await gen();

console.log(fromCode(57)); // Expected result: KEY_SPACE