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
