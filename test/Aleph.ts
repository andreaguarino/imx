import should = require("should");
import Aleph from "../src/Aleph";

describe("Aleph", () => {
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
      const xI = Aleph.init(x);
      xI.get("a").should.be.equal(1);
      xI.get("b").get("b1").should.be.equal(2);
      xI.get("c").get("c1").should.be.equal(3);
    });
  });
  describe("#set", () => {
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
      const xI = Aleph.init(x);
      const [xI2] = await xI.set("a", 2);
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
      const xI = Aleph.init(x);
      const bI = xI.get("b");
      const [bI2, xI2] = await bI.set("b1", 3);
      bI2.get("b1").should.be.equal(3);
      const xI2_b = xI2.get("b");
      xI2.get("b").get("b1").should.be.equal(3);
    });
  });
});
