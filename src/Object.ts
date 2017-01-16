type Value<A> = SimpleValue<A> | CompositeValue<A>

interface CompositeValue<A> {
  kind: "object",
  values: NamedValue<A>[]
}

interface SimpleValue<A> {
  kind: "value",
  value: A
}

interface NamedValue<A> {
  key: string,
  value: Value<A>
}

interface Crumb<A> {
  parentKey: string,
  otherProps: NamedValue<A>[]
}

type Zipper<A> = [Value<A>, IterableIterator<Crumb<A>>]

function SimpleValue<A>(value: A) : SimpleValue<A>{
  return {
    kind: "value",
    value: value
  }
}

function NamedValue<A>(key: string, value: Value<A>) : NamedValue<A> {
  return {
    key,
    value
  };
}

function CompositeValue<A>(values: NamedValue<A> []) : CompositeValue<A> {
  return {
    kind: "object",
    values
  };
}

function Crumb<A>(parentKey: string, otherProps: NamedValue<A> []) : Crumb<A> {
  return {
    parentKey,
    otherProps
  }
}

const test : Value<number> = CompositeValue([
  NamedValue("a", SimpleValue(1)),
  NamedValue("b", CompositeValue([
    NamedValue("c", SimpleValue(2))
  ])),
  NamedValue("d", SimpleValue(3))
]);

class Aleph <A> {
  root: Zipper<A>

  static of<A>(initObj : Dictionary<A> | A) : Zipper<A>{
    return null;
  }

  navigate(key: string) : Zipper<A>{
    const currValue = this.root[0];
    switch(currValue.kind) {
      case "value" :
        return this.root;
      case "object": {
        return [currValue.values.find(x => x.key === key).value, this.root[1].cons(Crumb(key, currValue.values))]
      }
    }
    
  }

}

class AlephObject<A> {
  private root: CompositeValue<A>
  private crumb: Crumb<A>[]

  constructor(initObj: Object) {
    this.root = this.buildTree(initObj);
    this.crumb = []
  }
  getTree() { return this.root; }
  get(key: string) : AlephObject<A> {
    let beforeProps: Value<A>[] = [];
    let afterProps: Value<A>[] = [];
    let found: Maybe<Value<A>>;
    this.root.values.forEach(v => {
      if (v.key === key) {
        found = v.value;
      } else {
        if (found) {
          afterProps.push(v.value);
        } else {
          beforeProps.push(v.value);
        }
      }
    });
    if (found) {
      this.crumb = this.crumb.concat({
        parentKey: key,
        beforeProps: [],
        afterProps: []
      });
    }
    return this;
  }

  buildTree(initObj: Object): CompositeValue<A> {
    return new CompositeValue(
      Object.entries(initObj).map(([k, v]) => {
        if (typeof v === "object" && !Array.isArray(v)) {
          return new NamedValue(k, this.buildTree(v));
        } else {
          return new NamedValue(k, new SimpleValue(v));
        }
      })
    );
  }

}

interface ObjectConstructor {
  entries<T>(o: { [s: string]: T }): [string, T][];
  entries(o: any): [string, any][];
}

type Dictionary<T> = { [key: string]: T }
type Maybe<T> = T | undefined
