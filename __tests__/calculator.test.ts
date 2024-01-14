import { getAmounts } from "@/lib/calculator"

describe("calculator", () => {
    it("should calculate", () => {
        // basic
        expect(getAmounts(100).amount).toEqual(100);
        // expect(getAmounts(10).fee).toEqual(0.59);

        // rounding
        // expect(getAmounts(0.01).fee).toEqual(0.31);
        // expect(getAmounts(10.01).fee).toEqual(0.32);
    })
})