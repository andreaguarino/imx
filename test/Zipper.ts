import should = require("should");
import * as Zipper from "../src/Zipper";

describe("Zipper", () => {
  describe("#init", function() {
    it("should never give back null, but a two-elements array", function() {
      const x = {};
      const xI = Zipper.init(x);

      should(xI).be.not.null();
      xI.should.be.an.Array().which.has.property("length").equal(2);
    });

    it("should create a zipper with the right kind and values", function() {
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

    it("should create an empty zipper from an empty object", function() {
      const x = {};
      const xI = Zipper.init(x);

      const focusedElement = xI[0];
      if (focusedElement.kind !== "object") {
        throw new Error(`invalid kind: ${focusedElement.kind}`);
      }

      const focusedElementValues = [...focusedElement.values()];
      focusedElementValues.length.should.equal(0);
    });

    it("should create a non-empty zipper from a single-level non-empty object", function() {
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
      focusedElementValues
        .map(v => v.key)
        .should.containEql("a")
        .containEql("b")
        .containEql("c");
      focusedElementValues
        .map(nv => nv.value)
        .map(v => (v.kind === "value" ? v.value : null))
        .filter(v => v != null)
        .should.containEql(1)
        .containEql(2)
        .containEql(3);
    });

    it("should create a multi-level zipper from a multi-level object", function() {
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

  describe("#get", function() {
    it("should return a simple value", function() {
      const x = {
        a: 1,
        b: 2,
        c: 3
      };
      const xI = Zipper.init(x);
      Zipper.get("a", xI).should.be.equal(1);
    });

    it("should return a nested value", function() {
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
    it("should work correctly after changing the focus", async function() {
      const x = {
        a: {
          a1: 2,
          a2: 5
        },
        b: 2,
        c: 3
      };
      const xI = Zipper.init<number>(x);
      const xI2 = await Zipper.setAll(["a", "a1"], 7, xI);
      Zipper.get("b", xI2).should.be.equal(2);
      Zipper.get("c", xI2).should.be.equal(3);
      Zipper.get(["a", "a1"], xI2).should.be.equal(7);
      Zipper.get(["a", "a1"], xI).should.be.equal(2);
      Zipper.get(["a", "a2"], xI2).should.be.equal(5);
      Zipper.get("a", xI2).should.be.Array();
      const aI2 = <Zipper.Zipper<number>>Zipper.get("a", xI2);
      Zipper.get("a1", aI2).should.be.equal(7);
    });
  });

  describe("#setAll", function() {
    it("should modify a one level zipper", function() {
      const x = {
        a: 1,
        b: 2,
        c: 3
      };
      const xI = Zipper.init<number>(x);
      Zipper.setAll("a", 5, xI).then(nextZipper => {
        should(nextZipper).be.not.null;
        nextZipper[0].should.have.property("kind").equal("value");
        nextZipper[0].should.have.property("value").equal(5);
        const crumbs = [...nextZipper[1]()];
        crumbs.length.should.be.equal(1);
        crumbs[0].should.have.property("parentKey").equal("a");
        const otherProps = [...crumbs[0].otherProps()];
        otherProps.length.should.be.equal(2);
      });
    });

    it("should modify a multi level zipper", function() {
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
      Zipper.setAll(["b", "b1"], 5, xI).then(nextZipper => {
        should(nextZipper).be.not.null;
        nextZipper[0].should.have.property("kind").equal("value");
        nextZipper[0].should.have.property("value").equal(5);
        const crumbs = [...nextZipper[1]()];
        crumbs.length.should.be.equal(2);
        crumbs[0].should.have.property("parentKey").equal("b1");
        const otherProps = [...crumbs[0].otherProps()];
        otherProps.length.should.be.equal(0);
      });
    });

    it("should go up on two consecutive #set calls", function() {
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
      Zipper.setAll(["b", "b1"], 5, xI)
        .then(z => Zipper.setAll(["c", "c1"], 10, z))
        .then(xI2 => {
          should(xI2).be.not.null;
          xI2[0].should.have.property("kind").equal("value");
          xI2[0].should.have.property("value").equal(10);
          const crumbs = [...xI2[1]()];
          crumbs.length.should.be.equal(2);
          crumbs[0].should.have.property("parentKey").equal("c1");
          const otherProps = [...crumbs[0].otherProps()];
          otherProps.length.should.be.equal(0);
        });
    });

    it("should work with async/await", async function() {
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
      const nextZipper = await Zipper.setAll(["b", "b1"], 5, xI);
      should(nextZipper).be.not.null;
      nextZipper[0].should.have.property("kind").equal("value");
      nextZipper[0].should.have.property("value").equal(5);
      const crumbs = [...nextZipper[1]()];
      crumbs.length.should.be.equal(2);
      crumbs[0].should.have.property("parentKey").equal("b1");
      const otherProps = [...crumbs[0].otherProps()];
      otherProps.length.should.be.equal(0);
    });
  });
});
