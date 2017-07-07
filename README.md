# Immutable Extensions

## Getting started

```
npm install imx
```

```javascript
import {Record} from 'imx';

const x = {
  a: 2,
  b: 5,
  c: {
    c1: 1,
    c2: 2
  }
};

const xI = Record.init(x);
console.log(xI.a); // 2
const yI = xI.set("b", 7);
console.log(yI.b); // 7
console.log(xI.b); // 5
```