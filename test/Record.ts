import should = require("should");
import Record from "../src/Record";

describe("Record", () => {
  describe("#get", () => {
    it("should return a simple value", function() {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const xI = Record.init(x);
      xI.a.should.be.equal(1);
      xI.b.b1.should.be.equal(2);
      xI.c.c1.should.be.equal(3);
      xI.get("a").should.be.equal(1);
      xI.get("b").get("b1").should.be.equal(2);
      xI.get("c").get("c1").should.be.equal(3);
    });
  });
  describe("#set", () => {
    it("should set a simple value", () => {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const imX = Record.init(x);
    });
  });
  describe("#setAll", () => {
    it("should set a simple value", async () => {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const xI = Record.init(x);
      const [xI2] = await xI.setAll("a", 2);
      xI2.a.should.be.equal(2);
      xI2.get("a").should.be.equal(2);
      xI2.get("b").get("b1").should.be.equal(2);
    });
    it("should set a simple value on the parent", async () => {
      const x = {
        a: 1,
        b: {
          b1: 2
        },
        c: {
          c1: 3
        }
      };
      const xI = Record.init(x);
      const bI = xI.get("b");
      const [bI2, xI2] = await bI.setAll("b1", 3);
      bI2.get("b1").should.be.equal(3);
      const xI2_b = xI2.get("b");
      xI2.get("b").get("b1").should.be.equal(3);
    });
  });
});
