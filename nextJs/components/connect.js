import { useWeb3ConnectionContext } from "../context/web3Connection.context"
import { NoCoreWalletError } from "@avalabs/web3-react-core-connector"
import { useState } from "react"
import { CoreNotFoundError } from "./coreNotFoundError"

export function Connect() {
    const { connector, useIsActive, useAccount } = useWeb3ConnectionContext()
    const isActive = useIsActive()
    const activeAccount = useAccount()
    const truncatedAddress = activeAccount ? `${activeAccount.slice(0, 5)}...${activeAccount.slice(-4)}` : 0
    const [activationError, setActivationError] = useState()

    if (activationError instanceof NoCoreWalletError) {
        return <CoreNotFoundError />
    }

    if (!isActive) {
        return (
            <button
                className="flex items-center justify-between w-300 h-12 bg-gray-800 font-bold rounded-lg border-none transition-colors duration-100 hover:bg-gray-700 text-white px-12 cursor-pointer"
                onClick={() => connector.activate().catch((e) => setActivationError(e))}
            >
                Connect with Core
                <img src={"/core.svg"} className="my-auto" />
            </button>
        )
    }

    return (
        <div className="flex items-center justify-between w-300 h-12 bg-gray-800 font-bold rounded-lg border-none transition-colors duration-100 hover:bg-gray-700 text-white px-12 cursor-pointer">
            <button
                className="flex items-center justify-between w-300 h-12 bg-gray-800 font-bold rounded-lg border-none transition-colors duration-100 hover:bg-gray-700 text-white px-12 cursor-pointer"
                onClick={() => location.reload()}
            >
                Connected: {truncatedAddress}
            </button>
        </div>
    )
}
