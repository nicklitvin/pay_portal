import { getTransactionFee } from "@/lib/calculator";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req : Request) {
    try {
        const amount = Number(req.url.split("?amount=")[1]);
        const roundedAmount = Math.round(amount * 100) / 100;

        const lineItems : Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "Payment"
                    },
                    unit_amount: roundedAmount * 100
                }
            },
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "Transaction Fee"
                    },
                    unit_amount: getTransactionFee(roundedAmount) * 100
                }
            }
        ]

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.STRIPE_RETURN_URL}?success=1`,
            cancel_url: `${process.env.STRIPE_RETURN_URL}?success=0`
        })

        return NextResponse.json({
            url: session.url,
            amount: amount
        }, {status: 200})

    } catch (err) {
        console.log(err);
        return NextResponse.json(null, {status: 500});
    }
}