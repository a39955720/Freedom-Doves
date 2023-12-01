import Head from "next/head"
import Header from "../components/Header"

export default function Home() {
    return (
        <div>
            <Head>
                <title>Freedom Doves</title>
                <meta name="description" content="A Freedom Doves project" />
            </Head>

            <Header />
        </div>
    )
}
