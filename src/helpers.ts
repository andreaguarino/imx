class Records<T> { 
  private obj : T;
  
  constructor(obj : T) {
    this.obj = obj;
  }

  set<U>(prop: string, value: any) : Records<U>{
    
  }
}

interface TrieNode<T> {
  children : Dictionary<TrieNode<T>>
  value : Maybe<T>
  isLast : boolean
}

class Trie<T> {
  private root: TrieNode<T>
  add() {}
  find() {}
  remove() {}
}







var shared = {
  t: 3
}

var myObject = {
  a: 2,
  b: {
    c: 3
  },
  d: 4
}

var myObject2 = new CompositeValue(
  [ new NamedValue("a", new SimpleValue(2))
  , new NamedValue("b", new CompositeValue(
    [ new NamedValue("c", new SimpleValue(3))]))
  , new NamedValue("d", new SimpleValue(4))
  ]);

// function up(z: Zipper<any>) : Zipper<any> {
//   const t = z[0];
//   switch(t.kind) {
//     case "value":
    
//   }
//   return []
// }

function up([item, [b, ...bs]]: Zipper<any>) : Zipper<any> {
  return [new CompositeValue([
  new NamedValue<any>(b.parentKey, new CompositeValue<any>(b.beforeProps))
  ]), bs.slice(1)]
}
//+ type Item a = Value a | CompositeValue [(String, Item a)]
//+ data Crumb a = (Maybe String) [Item a] [Item a] 
//+ type Zipper a = [Item a, [Crumb a]]




// class Crumb<A> {
//   parentKey : string
//   beforeProps : Item<A> []
//   afterProps : Item<A> []
//   constructor(parentKey: string, beforeProps : Item<any> [], afterProps : Item<any> []) {
//     this.parentKey = parentKey;
//     this.beforeProps = beforeProps;
//     this.afterProps = afterProps;
//   }
// }



