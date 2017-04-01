import should = require('should');
import R = require('ramda');
import { Generator, fromArray, nil, cons, except, withValue } from "../src/LazyList";

describe("LazyList", () => {
    describe("#fromArray", () => {
        it("should generate a non-empty lazy list from a non-empty array", () => {
            const lazyList = fromArray([1, 2, 3]);
            should(lazyList).be.not.null();
            lazyList.should.be.a.Function();
            const lazyListValues = [...lazyList()];
            lazyListValues.should.not.be.empty();
            lazyListValues.length.should.equal(3);
        });

        it("should add the elements to the lazy list in the right order",  () => {
            const lazyList = fromArray([1, 2, 3]);
            const lazyListValues = [...lazyList()];
            lazyListValues[0].should.equal(1);
            lazyListValues[lazyListValues.length - 1].should.equal(3);
        });

        it("should generate an empty lazy list from an empty array", () => {
            const lazyList = fromArray([]);
            should(lazyList).be.not.null();
            lazyList.should.be.a.Function();
            const lazyListValues = [...lazyList()];
            lazyListValues.should.be.empty();
        });
    });

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

        it("should be chainable with other #except", () => {
            const lazyListWithout2And3 = except(x => x == 3, except(x => x == 2, lazyList));
            const lazyListWithout2And3Values = [...lazyListWithout2And3()];
            lazyListWithout2And3Values.should.not.be.empty();
            lazyListWithout2And3Values.length.should.equal(8);
            lazyListWithout2And3Values.should.not.containEql(2);
            lazyListWithout2And3Values.should.not.containEql(3);
        });
    });

    describe("#withValue", () => {
        let lazyList : Generator<number>;
        let lazyListValues : number[];
        
        beforeEach (done => {
            lazyList = nil<number>();
            for(let i = 9; i >= 0; i--)
                lazyList = cons(i, lazyList);
            lazyListValues = [...lazyList()];    
            done();
        });

        it("should replace every element in the list equal to 'x' with 'y'", () => {
            const lazyListWith2Replaced = withValue(x => x == 2, 22, lazyList);
            const lazyListWith2ReplacedValues = [...lazyListWith2Replaced()];
            lazyListWith2ReplacedValues.should.not.be.empty();
            lazyListWith2ReplacedValues.length.should.equal(10);
            lazyListWith2ReplacedValues.should.not.containEql(2);
            lazyListWith2ReplacedValues.should.containEql(22);
        });

        it("should replace every element in the list satisfying a condition with 'y'", () => {
            const isEven = (x: number) => x % 2 == 0;
            const lazyListWith2Replaced = withValue(isEven, -1, lazyList);
            const lazyListWith2ReplacedValues = [...lazyListWith2Replaced()];
            lazyListWith2ReplacedValues.filter(isEven).length.should.equal(0);
        });

        it("should be chainable with other #withValue, on non-overlapping conditions", () => {
            const lazyListWith2And3Replaced = 
                withValue(x => x == 3, 33,
                    withValue(x => x == 2, 22,
                        lazyList));
            const lazyListWithout2And3Values = [...lazyListWith2And3Replaced()];
            lazyListWithout2And3Values.should.not.be.empty();
            lazyListWithout2And3Values.length.should.equal(10);
            lazyListWithout2And3Values.should.not.containEql(2);
            lazyListWithout2And3Values.should.not.containEql(3);
            lazyListWithout2And3Values.should.containEql(22);
            lazyListWithout2And3Values.should.containEql(33);
        });

        it("should be chainable with other #withValue, on overlapping conditions", () => {
            const lazyListWith2And3Replaced = 
                withValue(x => x == 33, 333,
                    withValue(x => x == 3, 33,
                        lazyList));
            const lazyListWithout2And3Values = [...lazyListWith2And3Replaced()];
            lazyListWithout2And3Values.should.not.be.empty();
            lazyListWithout2And3Values.length.should.equal(10);
            lazyListWithout2And3Values.should.not.containEql(3);
            lazyListWithout2And3Values.should.not.containEql(33);
            lazyListWithout2And3Values.should.containEql(333);
        });
    });
});