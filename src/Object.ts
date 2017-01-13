type Item<A> = Value<A> | CompositeValue<A>

interface CompositeValue<A> {
  kind: "object",
  values: NamedValue<A>[]
}

interface Value<A> {
  kind: "value",
  value: A
}

interface NamedValue<A> {
  key: string,
  value: Item<A>
}

interface Crumb<A> {
  parentKey: Maybe<string>,
  beforeProps: Item<A>[]
  afterProps: Item<A>[]
}

type Zipper<A> = [Item<A>, Crumb<A>[]]

class AlephObject<A> {
  private root: CompositeValue<A>
  private crumb: Crumb<A>[]

  constructor(initObj: Object) {
    this.root = this.buildTree(initObj);
    this.crumb = []
  }
  getTree() { return this.root; }
  get(key: string) : AlephObject<A> {
    let beforeProps: Item<A>[] = [];
    let afterProps: Item<A>[] = [];
    let found: Maybe<Item<A>>;
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
          return new NamedValue(k, new Value(v));
        }
      })
    );
  }

  set(): AlephObject<A> {

  }
}

interface ObjectConstructor {
  entries<T>(o: { [s: string]: T }): [string, T][];
  entries(o: any): [string, any][];
}

class CompositeValue<A> {
  values: NamedValue<A>[]
  kind: "object"
  constructor(values: NamedValue<A>[]) {
    this.values = values;
  }
}

class NamedValue<A> {
  key: string
  value: Item<A>
  constructor(key: string, value: Item<A>) {
    this.value = value;
    this.key = key;
  }
}

class Value<A> {
  kind: "value"
  value: A
  constructor(v: A) {
    this.value = v;
  }
}

type Dictionary<T> = { [key: string]: T }
type Maybe<T> = T | undefined

