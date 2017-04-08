import should = require('should');
import * as Zipper from "../src/Zipper"

describe("Zipper", () => {
  describe("#init", function () {
    it("should never give back null, but a two-elements array", function () {
      const x = {};
      const xI = Zipper.init(x);

      should(xI).be.not.null();
      xI.should.be.an.Array().which.has.property("length").equal(2);
    });

    it("should create a zipper with the right kind and values", function () {
      const x = {};
      const xI = Zipper.init(x);

      const focusedElement = xI[0];
      focusedElement.should.have.property("kind");
      if (focusedElement.kind !== "object") {
        throw new Error(`invalid kind: ${focusedElement.kind}`);
      }
      focusedElement.should.have.property("values");
      focusedElement.values.should.be.a.Function();
    });

    it("should create an empty zipper from an empty object", function () {
      const x = {};
      const xI = Zipper.init(x);

      const focusedElement = xI[0];
      if (focusedElement.kind !== "object") {
        throw new Error(`invalid kind: ${focusedElement.kind}`);
      }

      const focusedElementValues = [...focusedElement.values()];
      focusedElementValues.length.should.equal(0);
    });

    it("should create a non-empty zipper from a single-level non-empty object", function () {
      const x = {
        a: 1,
        b: 2,
        c: 3
      };
      const xI = Zipper.init(x);

      const focusedElement = xI[0];
      if (focusedElement.kind !== "object") {
        throw new Error(`invalid kind: ${focusedElement.kind}`);
      }

      const focusedElementValues = [...focusedElement.values()];
      focusedElementValues.length.should.equal(3);
      focusedElementValues.map(v => v.key).should
        .containEql("a")
        .containEql("b")
        .containEql("c");
      focusedElementValues
        .map(nv => nv.value)
        .map(v => v.kind === "value" ? v.value : null)
        .filter(v => v != null)
        .should
        .containEql(1)
        .containEql(2)
        .containEql(3);
    });

    it("should create a multi-level zipper from a multi-level object", function () {
      const x = {
        a: {
          a1: 1,
          a2: {
            a21: 2
          },
          a3: "hello"
        },
        b: 3,
        c: 4
      };

      const xI = Zipper.init(x);

      const focusedElement = xI[0];
      if (focusedElement.kind !== "object") {
        throw new Error(`invalid kind: ${focusedElement.kind}`);
      }

      const focusedElementValues = [...focusedElement.values()];
      focusedElementValues.length.should.equal(3);
      const firstSubElement = focusedElementValues.filter(e => e.key === "a");

      // TODO: to be continue from here
      /*
      firstSubElement.length.should.equal(1);
      const firstSubElementValue = firstSubElement[0].value;
      if (firstSubElementValue.kind !== "object") {
          throw new Error(`invalid kind: ${firstSubElement[0].value.kind}`);
      }

      firstSubElementValue.should.have.property("values");
      firstSubElementValue.values.should.be.a.Function();
      const firstSubElementValues = [...firstSubElementValue.values()];
      firstSubElementValues.length.should.equal(3);
      const firstSubElementFirstSubElement = focusedElementValues.filter(e => e.key === "a1");
      firstSubElementFirstSubElement.length.should.equal(1);
      const firstSubElementSecondSubElement = focusedElementValues.filter(e => e.key === "a2");
      firstSubElementSecondSubElement.length.should.equal(1);
      */
    });
  });

  describe("#get", function () {
    it("should return a simple value", function () {
      const x = {
        a: 1,
        b: 2,
        c: 3
      };
      const xI = Zipper.init(x);
      Zipper.get("a", xI).should.be.equal(1);
    });

    it("should return a nested value", function () {
      const x = {
        a: {
          a1: 2
        },
        b: 2,
        c: 3
      };
      const xI = Zipper.init<number>(x);
      const aI = Zipper.get("a", xI);
      if (Array.isArray(aI)) {
        Zipper.get("a1", aI).should.be.equal(2);
      }
    });
  });

  describe("#set", function () {
    it("should modify a one level zipper", function () {
      const x = {
        a: 1,
        b: 2,
        c: 3
      };
      const xI = Zipper.init<number>(x);
      Zipper.set("a", 5, xI).then(nextZipper => {
        should(nextZipper).be.not.null;
        nextZipper[0].should.have.property("kind").equal("value");
        nextZipper[0].should.have.property("value").equal(5);
        const crumbs = [...nextZipper[1]()];
        crumbs.length.should.be.equal(1);
        crumbs[0].should.have.property("parentKey").equal("a");
        const otherProps = [...crumbs[0].otherProps()];
        otherProps.length.should.be.equal(2);
      })
    });

    it("should modify a multi level zipper", function () {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const xI = Zipper.init<number>(x);
      Zipper.set(["b", "b1"], 5, xI).then(nextZipper => {
        should(nextZipper).be.not.null;
        nextZipper[0].should.have.property("kind").equal("value");
        nextZipper[0].should.have.property("value").equal(5);
        const crumbs = [...nextZipper[1]()];
        console.log(crumbs);
        crumbs.length.should.be.equal(2);
        crumbs[0].should.have.property("parentKey").equal("b1");
        const otherProps = [...crumbs[0].otherProps()];
        otherProps.length.should.be.equal(0);
      })
    });

    it("should go up on two consecutive #set calls", function () {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const xI = Zipper.init<number>(x);
      Zipper
        .set(["b", "b1"], 5, xI)
        .then(Zipper.set(["c", "c1"], 10))
        .then(xI2 => {
          should(xI2).be.not.null;
          xI2[0].should.have.property("kind").equal("value");
          xI2[0].should.have.property("value").equal(10);
          const crumbs = [...xI2[1]()];
          console.log(crumbs);
          crumbs.length.should.be.equal(2);
          crumbs[0].should.have.property("parentKey").equal("c1");
          const otherProps = [...crumbs[0].otherProps()];
          otherProps.length.should.be.equal(0);
        })
    })

    it("should update zippers taken from #get", function () {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const xI = Zipper.init<number>(x);
      /**
       * bI could be a function.
       * When call set on bI => different behaviour on the promise
       * The promise can return also the new xI
       */
      const bI = Zipper.get("b", xI);
      Zipper
        .set(["b1"], 5, bI)
        .then((bI2) => {
          const bI_2 = <Zipper.Zipper<number>>Zipper.get("b", xI);
          Zipper.get("b1", bI_2).should.be.equal(2);
          bI2[0].should.have.property("value").equal(5);
        });
    })
  })

  describe("#Context", function () {
    it("should #get and #set", function () {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const ImmutableContext = Zipper.Context.init(x, "xI");
      ImmutableContext
        .set(["b", "b1"], 5)
        .then(ImmutableContext1 => ImmutableContext1.set(["c", "c1"], 10))
        .then(ImmutableContext2 => {
          should(ImmutableContext2).be.not.null;
          ImmutableContext2.zipper[0].should.have.property("kind").equal("value");
          ImmutableContext2.zipper[0].should.have.property("value").equal(10);
          const crumbs = [...ImmutableContext2.zipper[1]()];
          console.log(crumbs);
          crumbs.length.should.be.equal(2);
          crumbs[0].should.have.property("parentKey").equal("c1");
          const otherProps = [...crumbs[0].otherProps()];
          otherProps.length.should.be.equal(0);
        })
    })
  })
});