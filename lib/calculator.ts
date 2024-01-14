const flat = 0.3
const percent = 0.029

export function getAmounts(amount : number) {
    const transactionFee = Math.ceil((amount + flat) / (1 - percent) * 100) / 100 - amount;
    const roundedFee = Math.round(transactionFee * 100) / 100;

    return {
        amount: amount,
        fee: roundedFee
    }
}