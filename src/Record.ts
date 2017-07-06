import * as Zipper from "./Zipper";

export type Z = Zipper.Zipper<any>;

export class Record {
  private zipper: Z;
  private parentKey: string = "";
  private parentRecord: Record = null;
  private childrenKeys: string[] = [];
  private childrenRecords: Record[] = [];
  allowedProps: string[] = [];
  inputObj: any;

  constructor(zipper: Z, parentRecord?: Record, parentKey?: string) {
    this.zipper = zipper;
    this.parentRecord = parentRecord || null;
    this.parentKey = parentKey || "";
  }

  static init<InputType>(input: InputType): Record & InputType {
    const rec = new Record(Zipper.init(input));
    rec.allowedProps = Object.keys(input);
    rec.inputObj = input;
    return <Record & InputType>proxify(rec);
  }

  get(key: string): Record {
    const value = Zipper.get(key, this.zipper);
    if (!Zipper.isZipper(value)) {
      return value;
    }
    let child = new PRecord(value, this, key);
    child.allowedProps = Object.keys(this.inputObj[key]);
    child.inputObj = this.inputObj[key];
    this.childrenRecords = this.childrenRecords.concat(child);
    this.childrenKeys.concat(key);
    return child;
  }

  set(key: string | string[], newValue: any): any {
    const newRecord = new PRecord(Zipper.set(key, newValue, this.zipper));
    newRecord.allowedProps = this.allowedProps;
    newRecord.inputObj = this.inputObj;
    return newRecord;
  }

  async setAll(key: string | string[], newValue: any): Promise<any[]> {
    let res: Record[] = [];
    key = Array.isArray(key) ? key : [key];
    // normal set on the focused object
    const currRecord = new PRecord(
      await Zipper.setAll(key, newValue, this.zipper)
    );
    currRecord.allowedProps = this.allowedProps;
    currRecord.inputObj = this.inputObj;
    res = res.concat(currRecord);
    // modify the parent Zipper - TODO: this should be lazy
    if (this.parentRecord) {
      const modifiedParent = new PRecord(
        await Zipper.setAll(
          [this.parentKey].concat(key),
          newValue,
          this.parentRecord.zipper
        )
      );
      modifiedParent.allowedProps = this.parentRecord.allowedProps;
      modifiedParent.inputObj = this.parentRecord.inputObj;
      res = res.concat(modifiedParent);
    }
    // modify all children - TODO: This should be lazy
    let i = 0;
    for (let child of this.childrenRecords) {
      let childRecord = new PRecord(
        await Zipper.setAll(
          key.concat(this.childrenKeys[i]),
          newValue,
          child.zipper
        )
      );
      childRecord.allowedProps = child.allowedProps;
      childRecord.inputObj = child.allowedProps;
      res = res.concat(childRecord);
      i += 1;
    }
    return res;
  }
}

const PRecord = new Proxy(Record, {
  construct(target, [zipper, parentZipper, parentKey], newTarget) {
    const r = new Record(zipper, parentZipper, parentKey);
    return proxify(r);
  }
});

export default PRecord;

function proxify(targetRecord: Record): Record {
  return new Proxy(targetRecord, {
    get(target, property, receiver) {
      if (target.allowedProps.find(p => p === property)) {
        return target.get(property.toString());
      }
      return target[property];
    }
  });
}
