"use client"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast";
import classNames from "classnames";
import { useRouter, useSearchParams } from "next/navigation";

const text = {
    notif_success_pay: "Payment completed successfully",
    notif_fail_pay: "Did not complete payment",
    notif_not_valid: "Enter a valid amount",
    notif_loading: "Loading...",
    notify_sucess_link: "Generated Stripe Link",
    notif_fail_link: "Error with Stripe Link",
    notif_copy: "Copied Link",

    title: "Stipe Link Generator",
    subtitle: `
        Enter a valid dollar amount and press generate to create a Stripe link.
        Press on the copy button to add it to your clipboard and paste it anywhere.
    `,
    generate: "Generate",
    copy_link: "Copy Stripe Link for $",
    go_to_pay: "Go to Payment Page"

}

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [payAmount, setPayAmount] = useState<number>();
    const [response, setResponse] = useState<{amount: number, url: string}>();

    useEffect( () => {
        const success = searchParams.get("success");

        if (success == "1") {
            toast.success(text.notif_success_pay);
        } else if (success == "0") {
            toast.error(text.notif_fail_pay);
        }
        window.history.pushState({path: "/"},"","/");
        
    }, [])

    const errorWithAmount = () => {
        toast.error(text.notif_not_valid);
    }

    const getLink = async () => {
        if (!payAmount || payAmount < 0) 
            return errorWithAmount()
        
        const amountSplit = payAmount?.toString().split('.');

        if (amountSplit.length > 2 || (amountSplit.length == 2 && amountSplit[1].length > 2) )  
            return errorWithAmount()

        toast.promise(
            axios.get(`/api/getLinks?amount=${payAmount}`),
            {
                error: text.notif_fail_link,
                loading: text.notif_loading,
                success: (response) => {
                    setResponse(response.data)
                    return text.notify_sucess_link
                }
            }
        )
    }

    const copyLink = () => {
        if (response) navigator.clipboard.writeText(response.url)
        toast.success(text.notif_copy);
    }

    const openPayPage = () => {
        if (response) {
            router.push(response.url);
        }
    }

    return (
        <div className="flex flex-col gap-5 justify-center items-center h-full bg-back">
            <h1 className="text-4xl font-bold">{text.title}</h1>
            <p className="text-center w-3/5 whitespace-pre-line">{text.subtitle}</p>
            <input
                type="number"
                placeholder="Enter $ Amount"
                className="p-3 text-center rounded-xl"
                onChange={(e) => setPayAmount(Number(e.target.value))}
            />
            <button
                className="p-3 rounded-xl bg-first text-white hover:brightness-75"
                onClick={getLink}
            >
                {text.generate}
            </button>
            <div className="flex gap-3">
                <button 
                    disabled={!response}
                    onClick={copyLink}
                    className={classNames(
                        "bg-first text-white p-3 rounded-xl",
                        response ? "hover:cursor-grab" : "hover:cursor-not-allowed brightness-50"
                    )}
                >
                    {`${text.copy_link}${response?.amount || 0}`}
                </button>
                <button
                    disabled={!response}
                    onClick={openPayPage}
                    className={classNames(
                        "bg-first text-white p-3 rounded-xl",
                        response ? "hover:cursor-grab" : "hover:cursor-not-allowed brightness-50"
                    )}
                >
                    {text.go_to_pay}
                </button>
            </div>
        </div>
    )
}