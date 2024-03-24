import { MoralisProvider } from "react-moralis"
import React from "react"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <React.StrictMode>
                <Component {...pageProps} />
            </React.StrictMode>
        </MoralisProvider>
    )
}

export default MyApp
