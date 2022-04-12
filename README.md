# pubo-utils

### install

`$ npm install --save pubo-utils`

### nodejs

```javascript
const { SyncQueue } = require('pubo-utils');
```

### front-end

```javascript
import { SyncQueue } from 'pubo-utils';
```

### For example

```javascript
const queue = new SyncQueue();

const run = (i) => {
  return new Promise((resolve) => setTimeout(() => resolve(`hello ${i}`), 1000));
};

const test = async (i) => {
  const res = await queue.push(() => run(i));
  console.log(res);
};

for (let i = 0; i < 10; i++) {
  test(i);
}
```
