import * as LazyList from "./LazyList"

export type Value<A> = SimpleValue<A> | CompositeValue<A>

export interface CompositeValue<A> {
  kind: "object",
  values: LazyList.Generator<NamedValue<A>>
}

export interface SimpleValue<A> {
  kind: "value",
  value: A
}

export interface NamedValue<A> {
  key: string,
  value: Value<A>
}

export function SimpleValue<A>(value: A) : SimpleValue<A>{
  return {
    kind: "value",
    value: value
  }
}

export function NamedValue<A>(key: string, value: Value<A>) : NamedValue<A> {
  return {
    key,
    value
  };
}

export function CompositeValue<A>(values: LazyList.Generator<NamedValue<A>>) : CompositeValue<A> {
  return {
    kind: "object",
    values
  };
}

// const test : Value<number> = CompositeValue([
//   NamedValue("a", SimpleValue(1)),
//   NamedValue("b", CompositeValue([
//     NamedValue("c", SimpleValue(2))
//   ])),
//   NamedValue("d", SimpleValue(3))
// ]);

// class AlephObject<A> {
//   private root: CompositeValue<A>
//   private crumb: Crumb<A>[]

//   constructor(initObj: Object) {
//     this.root = this.buildTree(initObj);
//     this.crumb = []
//   }
//   getTree() { return this.root; }
//   get(key: string) : AlephObject<A> {
//     let beforeProps: Value<A>[] = [];
//     let afterProps: Value<A>[] = [];
//     let found: Maybe<Value<A>>;
//     this.root.values.forEach(v => {
//       if (v.key === key) {
//         found = v.value;
//       } else {
//         if (found) {
//           afterProps.push(v.value);
//         } else {
//           beforeProps.push(v.value);
//         }
//       }
//     });
//     if (found) {
//       this.crumb = this.crumb.concat({
//         parentKey: key,
//         beforeProps: [],
//         afterProps: []
//       });
//     }
//     return this;
//   }

//   // buildTree(initObj: Object): CompositeValue<A> {
//   //   return new CompositeValue(
//   //     Object.entries(initObj).map(([k, v]) => {
//   //       if (typeof v === "object" && !Array.isArray(v)) {
//   //         return new NamedValue(k, this.buildTree(v));
//   //       } else {
//   //         return new NamedValue(k, new SimpleValue(v));
//   //       }
//   //     })
//   //   );
//   // }

// }


type Dictionary<T> = { [key: string]: T }
type Maybe<T> = T | undefined
