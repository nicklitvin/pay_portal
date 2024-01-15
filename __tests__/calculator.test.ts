import { getTransactionFee } from "@/lib/calculator"

describe("calculator", () => {
    it("should calculate", () => {
        expect(getTransactionFee(10)).toEqual(0.61);
        expect(getTransactionFee(10.01)).toEqual(0.61);
        expect(getTransactionFee(0.01)).toEqual(0.31);
        expect(getTransactionFee(1.99)).toEqual(0.37);
    })
})