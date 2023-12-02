import { MoralisProvider } from "react-moralis"
import React from "react"
import { Web3ConnectionContextProvider } from "../context/web3Connection.context"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <React.StrictMode>
                <Web3ConnectionContextProvider>
                    <Component {...pageProps} />
                </Web3ConnectionContextProvider>
            </React.StrictMode>
        </MoralisProvider>
    )
}

export default MyApp
