import should = require('should');
import * as Zipper from "../src/Zipper"

describe("Zipper", () => {
    describe.only("#init", function () {
        it("shoudl never give back null, but a two-elements array", function() {
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
                .map(v => v.kind  === "value" ? v.value : null)
                .filter(v => v != null)
                .should
                    .containEql(1)
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
            const xI = Zipper.init(x);
            const aI = Zipper.get("a", xI);
            Zipper.get("a1", aI).should.be.equal(2);
        })
    })
})