class LazyList<A> {
    initList: IterableIterator<A>
    constructor(initList : A []) {
        this.initList = initList.reduce((lazyList, currElem) => this.cons(currElem), this.cons(null));
    }
    * cons(value: A): IterableIterator<A> {
        yield value;
        yield* this.initList;
    }

    * except(predicate: (value: A) => boolean): IterableIterator<A> {
        for (let item of this.initList) {
            if (!predicate(item)) {
                yield item;
            }
        }
    }

    * with(predicate: (value: A) => boolean, newValue: A): IterableIterator<A> {
        yield newValue;
        yield* this.except(predicate);
    }
}