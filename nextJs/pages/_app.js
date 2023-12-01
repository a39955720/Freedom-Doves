import { MoralisProvider } from "react-moralis"
import { Web3ConnectionContextProvider } from "../context/web3Connection.context"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <Web3ConnectionContextProvider>
                <Component {...pageProps} />
            </Web3ConnectionContextProvider>
        </MoralisProvider>
    )
}

export default MyApp
