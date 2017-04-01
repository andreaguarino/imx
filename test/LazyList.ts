import should = require('should');
import { Generator, nil, cons, except } from "../src/LazyList";

describe("LazyList", () => {
    describe("#nil", () => {
        it("should give back an empty LazyList", () => {
            const lazyList = nil();
            should(lazyList).be.not.null();
            lazyList.should.be.a.Function();
        });

        it("should generate a zero-elements LazyList generator, when invoked and the resulting LazyList is invoked", () => {
            const lazyListIterator = nil()();
            should(lazyListIterator).be.a.iterator();
            const lazyListValues = [...lazyListIterator];
            lazyListValues.should.be.empty();
        });
    });

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

        it("should generate an N-elements list, when deep nested", () => {
            let lazyList = nil();
            for(let i = 9; i >= 0; i--)
                lazyList = cons(i, lazyList);

            const lazyListValues = [...lazyList()];
            lazyListValues.should.not.be.empty();
            lazyListValues.length.should.equal(10);
            lazyListValues.should.deepEqual([...Array(10).keys()]);
        });
    }); 

    describe("#except", () => {
        let lazyList : Generator<number>;
        let lazyListValues : number[];
        
        beforeEach (done => {
            lazyList = nil<number>();
            for(let i = 9; i >= 0; i--)
                lazyList = cons(i, lazyList);
            lazyListValues = [...lazyList()];    
            done();
        });

        it("should filter out the specified element from a lazy list, when present", () => {            
            const lazyListWithout2 = except(x => x == 2, lazyList);
            const lazyListWithout2Values = [...lazyListWithout2()];
            lazyListWithout2Values.should.not.be.empty();
            lazyListWithout2Values.length.should.equal(9);
            lazyListWithout2Values.should.not.containEql(2);
        });

        it("should filter out a group of element from a lazy list, based on a predicate", () => {
            const lazyListWithoutEvenElements = except(x => x % 2 == 0, lazyList);
            const lazyListWithoutEvenElementsValues = [...lazyListWithoutEvenElements()];
            lazyListWithoutEvenElementsValues.should.not.be.empty();
            lazyListWithoutEvenElementsValues.length.should.equal(5);
            lazyListWithoutEvenElementsValues.should.not.containEql(2);
            lazyListWithoutEvenElementsValues.should.not.containEql(4);
        });

        it("should filter out nothing, when the predicate is never satified", () => {
            const lazyListWithAllTheElements = except(x => false, lazyList);
            const lazyListWithAllTheElementsValues = [...lazyListWithAllTheElements()];
            lazyListWithAllTheElementsValues.should.deepEqual(lazyListValues);
        });

        it("should filter out everything, when the predicate is always satified", () => {
            const lazyListWithAllTheElements = except(x => true, lazyList);
            const lazyListWithAllTheElementsValues = [...lazyListWithAllTheElements()];
            lazyListWithAllTheElementsValues.should.be.empty();
        });
    });
});