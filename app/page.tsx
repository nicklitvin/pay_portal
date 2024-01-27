"use client"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const text = {
    notif_pay_success: "Payment completed successfully",
    notif_pay_error: "Did not complete payment",
    notif_input_not_valid: "Enter a valid amount",
    notif_input_not_enough: "Min. payment $0.20",
    notif_loading: "Processing amount from URL...",
    notif_link_copied: "Copied Link to Clipboard",
    notif_link_fail: "Server Error",
    notif_url_amount_error: "Error with url amount",

    title: "Stripe Payment Portal",
    subtitle: `
        Enter a dollar amount to create a Stripe Checkout Page with a Transaction Fee 
        Min. payment is $0.20
        Transaction Fee is equal to 2.9% + $0.30

        Generate Link will copy Stripe link to your clipboard (expires in 24hrs)
        Create Simple Link will send users to this page and then to Stripe (recommended)
        Complete payment will redirect you to the checkout page
    `,
    generate_link: "Generate Link",
    complete_pay: "Complete Payment",
    simple_link: "Create Simple Link"
}

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [payAmount, setPayAmount] = useState<string>("");
    const [redirecting, setRedirecting] = useState<boolean>(true);

    useEffect( () => {
        const checkAmount = async () => {
            const amount = searchParams.get("amount");

            if (amount && isPayAmountValid(amount).valid) {
                try {
                    const response = await axios.get(`/api/getLinks?amount=${amount}`);
                    if (response.data.url) {
                        window.history.pushState({path: "/"},"","/");
                        router.push(response.data.url);
                    }
                } catch (err) {
                    toast.error(text.notif_link_fail)
                }
            } else if (amount) {
                toast.error(text.notif_url_amount_error)
            }
            setRedirecting(false);
        }

        const checkSuccess = async () => {
            const success = searchParams.get("success");

            if (success == "1") {
                toast.success(text.notif_pay_success);
            } else if (success == "0") {
                toast.error(text.notif_pay_error);
            }
            window.history.pushState({path: "/"},"","/");
        }

        checkAmount();
        checkSuccess();
    }, [])

    const isPayAmountValid = (amount : string)  => {
        const result : {valid: boolean, message: string} = {
            valid: true,
            message: ""
        }

        const numberAmount = Number(amount);
        
        if (Number.isNaN(numberAmount)) {
            result.valid = false;
            result.message = text.notif_input_not_valid
        } else if (numberAmount < 0.2) {
            result.valid = false;
            result.message = text.notif_input_not_enough;
        } 

        return result;
    }


    const generateLink = async (openLink : boolean) => {
        const amountInfo = isPayAmountValid(payAmount);

        if (!amountInfo.valid) 
            return toast.error(amountInfo.message)

        try {
            await toast.promise(
                axios.get(`/api/getLinks?amount=${payAmount}`),
                {
                    error: text.notif_link_fail,
                    loading: text.notif_loading,
                    success: (response) => {
                        if (openLink) {
                            router.push(response.data.url)
                            return null
                        } else {
                            navigator.clipboard.writeText(response.data.url)
                            return text.notif_link_copied
                        }
                    }
                }
            )
        } catch (err) {}
    }

    const generateSimpleLink = async() => {
        const amountInfo = isPayAmountValid(payAmount);

        if (!amountInfo.valid) 
            return toast.error(amountInfo.message)

        navigator.clipboard.writeText(
            `${window.location.href}?amount=${payAmount}`
        );
        toast.success(text.notif_link_copied);
    }

    if (redirecting) {
        return (
            <div className="bg-back w-full h-full justify-center items-center flex">
                <h1 className="text-center font-bold text-4xl">{text.notif_loading}</h1>
            </div>
        )
    } else {
        return (
            <div className="flex flex-col gap-5 justify-center items-center h-full bg-back">
                <h1 className="text-4xl font-bold text-center">{text.title}</h1>
                <p className="text-center w-3/5 whitespace-pre-line">{text.subtitle}</p>
                <input
                    type="number"
                    placeholder="Enter $ Amount"
                    className="p-3 text-center rounded-xl"
                    onChange={(e) => setPayAmount(e.target.value)}
                />
                <div className="flex gap-3">
                    <button 
                        onClick={ () => generateLink(false)}
                        className="bg-first p-3 text-white rounded-xl hover:brightness-75"
                    >
                        {text.generate_link}
                    </button>
                    <button
                        onClick={() => generateLink(true)}
                        className="bg-first text-white p-3 rounded-xl hover:brightness-75"
                    >
                        {text.complete_pay}
                    </button>
                    <button
                        onClick={() => generateSimpleLink()}
                        className="bg-first text-white p-3 rounded-xl hover:brightness-75"
                    >
                        {text.simple_link}
                    </button>
                </div>
            </div>
        )
    }
}