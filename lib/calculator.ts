const flat = 0.3
const percent = 0.029

export function getTransactionFee(amount : number) {
    const total = ( amount + flat ) / ( 1 - percent );
    const transactionFee = total - amount;
    const roundedFee = Math.ceil(transactionFee * 100) / 100
    return roundedFee
}