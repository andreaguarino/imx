import should = require('should');
import * as Zipper from "../src/Zipper"

describe("Zipper", () => {
    describe("#init", function () {
        it("should create a simple object", function () {
            var x = {
                a: 1,
                b: 2,
                c: 3
            };
            const xI = Zipper.init(x);
            xI.should.be.not.null();
            const focusedElement = xI[0];
            focusedElement.should.have.property("kind").equal("object");
            focusedElement.should.have.property("values");
        })
    });

    describe("#get", function () {
        it("should return a simple value", function () {
            var x = {
                a: 1,
                b: 2,
                c: 3
            };
            const xI = Zipper.init(x);
            Zipper.get("a", xI).should.be.equal(1);
        });

        it("should return a nested value", function () {
            var x = {
                a: {
                    a1: 2
                },
                b: 2,
                c: 3
            };
            const xI = Zipper.init(x);
            const aI = Zipper.get("a", xI);
            Zipper.get("a1", aI).should.be.equal(2);
        })
    })
})