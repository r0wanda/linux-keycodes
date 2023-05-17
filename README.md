# Linux-keycodes

A list of linux keycodes (source: [input-event-codes.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h))

Example usage:
```js
import { fromCode } from 'linux-keycodes';
console.log(
    fromCode(57)
); // Should output KEY_SPACE
```
