import { getAmounts } from "@/lib/calculator";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req : Request) {
    try {
        const valueRecieved = Number(req.url.split("?amount=")[1]);
        const values = getAmounts(valueRecieved);

        const lineItems : Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "Payment"
                    },
                    unit_amount: values.amount * 100
                }
            },
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "Transaction Fee"
                    },
                    unit_amount: values.fee * 100
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
            amount: values.amount
        }, {status: 200})

    } catch (err) {
        console.log(err);
        return NextResponse.json(null, {status: 500});
    }
}