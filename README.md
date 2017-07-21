# Immutable Extensions

Yet another library on persistent Records in JavaScript.

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

## API
### Record.init
*Complexity: O(n)*
```
init(obj: Object) : Record
```
Static function used to create a new Record from an initial JavaScript Object.
### Record.prototype.get
*Complexity: O(n)*
```
get(propertyNameOrPath: string | string []) : T | Record
```
Method on Record used to get a property given its name. Alternatively it's possible to access the property via standard dot notation.
*xI.get("a");* is equivalent to xI.a thanks to ES6 Proxy.

### Record.prototype.set
*Complexity: O(n)*
```
set(propertyNameOrPath: string | string [], newValue: any) : Record
```
Setter method on Record. It takes the property name and the new given value as input and it returns a new Record with the specified field modified.

