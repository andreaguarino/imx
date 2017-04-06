import { Value, NamedValue, SimpleValue, CompositeValue } from "./TreeElement"
import * as LazyList from "./LazyList"
import * as R from "ramda"

export type Zipper<A> = [Value<A>, LazyList.Generator<Crumb<A>>]

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

function buildTree(initObj: Object): CompositeValue<any> {
  return CompositeValue(
    Object.keys(initObj)
      .reduce<LazyList.Generator<any>>(
      (list, k: string) => {
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

/**
 * Navigates around the tree object
 * @param path 
 * @param zipper 
 */
function focus<A>(path: string[], zipper: Zipper<A>): Zipper<A> {
  const steps = countUpSteps(path, zipper);
  const updatedZipper = [...Array(steps).keys()].reduce<Zipper<A>>(
    function (newZipper, step) {
      return goUp(newZipper);
    },
    zipper
  )
  return path.reduce<Zipper<A>>
    (
    function (resultZipper, key) {
      const currValue = resultZipper[0];
      switch (currValue.kind) {
        case "value":
          return resultZipper;
        case "object": {
          const nextValue = LazyList.find(x => x.key === key, currValue.values);
          const nextCrumb = Crumb(key, LazyList.except(x => x.key === key, currValue.values));
          return nextValue
            ? [nextValue.value, LazyList.cons(nextCrumb, resultZipper[1])]
            : resultZipper;
        }
      }
    },
    updatedZipper
    );
}

function countUpSteps<A>(path: string[], zipper: Zipper<A>): number {
  const crumbsR = [...zipper[1]()].reverse();
  if (crumbsR.length === 0) {
    return 0;
  }
  let counter = 0;
  while (path[counter] === crumbsR[counter].parentKey && counter < path.length) {
    counter += 1;
  }
  return crumbsR.length - counter;
}

export function goUp<A>(zipper: Zipper<A>): Zipper<A> {
  const crumbs = zipper[1];
  const parent = LazyList.head(crumbs);
  const focusedValue =
    CompositeValue(
      LazyList.cons(
        NamedValue(parent.parentKey,
          zipper[0]), parent.otherProps
      ));
  return [focusedValue, LazyList.tail(zipper[1])]
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
          return [nextValue, <LazyList.Generator<Crumb<A>>>LazyList.nil()];
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

function _set<A>(key: string | string[], newValue: A, zipper: Zipper<A>): Promise<Zipper<A>> {
  const updatedZipper = Array.isArray(key)
    ? focus(key, zipper)
    : focus([key], zipper);
  const lastKey = Array.isArray(key)
    ? key[key.length - 1]
    : key;
  const currValue = updatedZipper[0];
  if (typeof newValue === "object") {
    return Promise.resolve(
      <Zipper<A>>[buildTree(newValue), updatedZipper[1]]);
  } else {
    return Promise.resolve(
      <Zipper<A>>[SimpleValue(newValue), updatedZipper[1]]);
  }
};

export const set = R.curry(_set);