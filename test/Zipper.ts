import Zipper from "../src/Zipper"

const object1 = Zipper.init({a: 1, b: 2, c: 3});
const object2 = Zipper.set("a", 10, object1);
Zipper.get("a", object1); // 1
Zipper.get("a", object2); // 10

const myObj = {
    a0: {
        b0: {
            c0: 1,
            c1: 6
        },
        b1: 4,
        b2: 5
    },
    a1: 2,
    a2: 3
}

const myObjImmutable = Zipper.init(myObj);
const myObjImmutable1 = Zipper.set("a0.b0.c0", 11, myObjImmutable); 
// [#b0, [
//    ("b0",[b1: 4, b2: 5]),
//    ("a0", [a1: 2, a2: 3])
// ]]
Zipper.set("a0.b1", 20, myObjImmutable1); // [#a0, [("a0", [a1: 2, a2: 3])]] => UP, 
