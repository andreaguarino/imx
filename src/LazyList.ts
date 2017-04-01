export type Generator<A> = () => IterableIterator<A>
type Predicate<A> = (item: A) => boolean

export function nil<A>() : Generator<A> {
  return function* () : IterableIterator<A> {
    yield* [][Symbol.iterator]();
  };
}

export function cons<A>(value: A, list: Generator<A> | A) {
  return function* () {
    yield value;
    yield* typeof list === "function" ?
      list() :
      [list][Symbol.iterator]();
  };
}

export function except<A>(predicate : Predicate<A>, list : Generator<A>) {
  return function* () {
    for (let item of list()) {
      if (!predicate(item)) {
        yield item;
      }
    }
  };
}

export function withValue<A>(predicate: Predicate<A>, newValue : A, list: Generator<A>) {
  return function* () {
    yield newValue;
    for (let item of list()) {
      if (!predicate(item)) {
        yield item;
      }
    }
  };
}

export function find<A>(predicate: Predicate<A>, list: Generator<A>) : A {
  for (let item of list()) {
    if (predicate(item)) {
      return item;
    }
  }
}



var list = cons(1, cons(2, 3));


var list2 = except(x => x === 2, list);

var list3 = withValue(x => x === 2, 1, list);

for (let value of list()) {
  console.log(value)
}

for (let value of list()) {
  console.log(value)
}

