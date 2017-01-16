type Key = String
data NamedValue a = NamedValue Key (Value a)
data CompositeValue a = CompositeValue [NamedValue a]
data SimpleValue a = SimpleValue a
type Value a = CompositeValue a | SimpleValue a

type ParentKey = String
type beforeProps a = [NamedValue a]
type afterProps a = [NamedValue a]

data Crumb a = Crumb (Maybe ParentKey) beforeProps afterProps
type Zipper a = (Value a, [Crumb a])


myObject :: Value Int
myObject = CompositeValue 
    [   NamedValue "a" (SimpleValue 1) 
    ,   NamedValue "b"  (CompositeValue 
            [NamedValue "c" (SimpleValue 2)])
    ,   NamedValue "d" (SimpleValue 3)
    ]

