import { Value, NamedValue, SimpleValue, CompositeValue } from "./TreeElement"
import * as LazyList from "./LazyList"
import * as R from "ramda"

type Zipper<A> = [Value<A>, LazyList.Generator<Crumb<A>>]

interface Crumb<A> {
  parentKey: string,
  otherProps: LazyList.Generator<NamedValue<A>>
}

function Crumb<A>(parentKey: string, otherProps: LazyList.Generator<NamedValue<A>>): Crumb<A> {
  return {
    parentKey,
    otherProps
  }
}

export function init<A>(initObj: Object): Zipper<A> {
  return [buildTree(initObj), <LazyList.Generator<Crumb<A>>>LazyList.nil()];
}

function buildTree(initObj: Object) : CompositeValue<any>{
  return CompositeValue(
    Object.keys(initObj)
    .reduce<LazyList.Generator<any>>(
      (list, k : string) => {
        const v = initObj[k];
        if (typeof v === "object" && !Array.isArray(v)) {
          return LazyList.cons(NamedValue(k, buildTree(v)), list);
        } else {
          return LazyList.cons(NamedValue(k, SimpleValue(v)), list);
        }
      },
      LazyList.nil())
    );
}

function navigate<A>(key: string, zipper: Zipper<A>): Zipper<A> {
  const currValue = zipper[0];
  switch (currValue.kind) {
    case "value":
      return zipper;
    case "object": {
      const nextValue = LazyList.find(x => x.key === key, currValue.values);
      const nextCrumb = Crumb(key, LazyList.except(x => x.key === key, currValue.values));
      return nextValue ?
        [nextValue.value, LazyList.cons(nextCrumb, zipper[1])]
        : zipper;
    }
  }
}

/**
 * Usage:
 * ```javascript
 * // {a: 2}
 * Zipper.get("a", myObj); // => 2
 * // {b: {c: 2}}
 * Zipper.get("b", myObj); // [#b, null]
 * Zipper.get("b.c", myObj) // 2
 * ```
 */
export function get<A>(key: string, zipper: Zipper<A>): A | Zipper<A> {
  const currValue = zipper[0];
  switch (currValue.kind) {
    case "value":
      return currValue.value;
    case "object":
      const nextValue = LazyList.find(x => x.key === key, currValue.values).value;
      switch (nextValue.kind) {
        case "value":
          return nextValue.value;
        case "object":
          return [nextValue, null];
      }
  }
}

/**
 * Usage:
 * ```javascript
 * // {a: 2}
 * Zipper.set("a", 3, myObj); // [3, Crumb("a", [])]
 * // {b: {c: 2}}
 * Zipper.get("b", myObj); // [#b, null]
 * Zipper.get("b.c", myObj) // 2
 * ```
 */

function _set<A>(key: string, newValue: A, zipper: Zipper<A>): Promise<Zipper<A>> {
  const currValue = zipper[0];
  switch (currValue.kind) {
    case "value":
      return Promise.resolve(zipper);
    case "object":
      const modifiedValues = LazyList.withValue(
        x => x.key === key,
        NamedValue(key, SimpleValue(newValue)),
        currValue.values)
      return Promise.resolve(
        <Zipper<A>>[CompositeValue(modifiedValues), zipper[1]]
      )
  }
};

export const set = R.curry(_set);