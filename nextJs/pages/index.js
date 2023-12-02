import Head from "next/head"
import Header from "../components/Header"
import Home from "../components/Home"

export default function () {
    return (
        <div className="bg-gray-300 flex-col min-h-screen">
            <Head>
                <title>Freedom Doves</title>
                <meta name="description" content="A Freedom Doves project" />
            </Head>
            <Header />
            <Home />
        </div>
    )
}
