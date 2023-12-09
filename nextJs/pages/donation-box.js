import Head from "next/head"
import Header from "../components/Header"
import DonationBox from "../components/DonationBox"

export default function Home() {
    return (
        <div className="bg-gray-300 flex-col min-h-screen">
            <Head>
                <title>UMA Time Card</title>
                <meta name="description" content="Donation box" />
            </Head>
            <Header />
            <DonationBox />
        </div>
    )
}
