import should = require('should');
import { cons } from "../src/LazyList";

describe("LazyList", () => {
    describe("#cons", () => {
        it("should give back a LazyList of two elements (which is a 'generator builder'), when invoked with two primitive values", () => {
            const lazyList = cons(1, 2);
            should(lazyList).be.not.null();
            lazyList.should.be.a.Function();
        });

        it("should generate a two-elements LazyList generator, when invoked with two primitive values and the resulting LazyList is invoked", () => {
            const lazyListIterator = cons(1, 2)();
            should(lazyListIterator).be.a.iterator();
            const lazyListValues = [...lazyListIterator];
            lazyListValues.should.not.be.empty();
            lazyListValues.length.should.equal(2);
            lazyListValues.should.deepEqual([1,2]);
        });

        it("should give back a LazyList of three elements, when invoked in a nested way", () => {
            const lazyList = cons(1, cons(2, 3));
            should(lazyList).be.not.null();
            lazyList.should.be.a.Function();
        });

        it("should generate a three-elements LazyList generator, when invoked with three primitive values and the resulting LazyList is invoked", () => {
            const lazyListIterator = cons(1, cons(2, 3))();
            should(lazyListIterator).be.a.iterator();
            const lazyListValues = [...lazyListIterator];
            lazyListValues.should.not.be.empty();
            lazyListValues.length.should.equal(3);
            lazyListValues.should.deepEqual([1,2,3]);
        });
    }); 
});