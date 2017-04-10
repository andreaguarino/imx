import * as Zipper from "./Zipper";

type Z = Zipper.Zipper<any>;

export default class Aleph {
  private zipper: Z;
  private parentKey: string = "";
  private parentZipper: Aleph = null;
  private childrenKeys: string[] = [];
  private childrenZippers: Aleph[] = [];

  constructor(zipper: Z, parentZipper?: Aleph, parentKey?: string) {
    this.zipper = zipper;
    this.parentZipper = parentZipper || null;
    this.parentKey = parentKey || "";
  }
  static init(input: Object): Aleph {
    return new Aleph(Zipper.init(input));
  }
  get(key: string): Aleph {
    const value = Zipper.get(key, this.zipper);
    if (!Zipper.isZipper(value)) {
      return value;
    }
    let child = new Aleph(value, this, key);
    this.childrenZippers = this.childrenZippers.concat(child);
    this.childrenKeys.concat(key);
    return child;
  }
  async set(key: string | string[], newValue: any): Promise<Aleph[]> {
    let res: Aleph[] = [];
    // normal set on the focused object
    res = res.concat(new Aleph(await Zipper.set(key, newValue, this.zipper)));
    // modify the parent Zipper - TODO: this should be lazy
    if (this.parentZipper) {
      const modifiedParent = await Zipper.set(
        `${this.parentKey}.${key}`,
        newValue,
        this.parentZipper.zipper
      );
      res = res.concat(new Aleph(modifiedParent));
    }
    // modify all children - TODO: This should be lazy
    let i = 0;
    for (let child of this.childrenZippers) {
      res = res.concat(
        new Aleph(await Zipper.set(`${key}.${this.childrenKeys[i]}`, newValue, child.zipper))
      );
      i += 1;
    }
    return res;
  }
}