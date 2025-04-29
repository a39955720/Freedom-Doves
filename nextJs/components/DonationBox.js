import { useWeb3ConnectionContext } from "../context/web3Connection.context"
import { DonationBoxAbi } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function DonationBox() {
    const { useIsActive, useAccount } = useWeb3ConnectionContext()
    const [chainId, setChainId] = useState("0")
    const [totalUSD, setTotalUSD] = useState("")
    const [totalAvax, setTotalAvax] = useState("")
    const [totalDonation, setTotalDonation] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const isActive = useIsActive()
    const account = useAccount()
    const donationBoxAddress = "0xb2bb2cf50a7efbad1541d3ac12887b5c3ee6fd8f"

    const networks = {
        fuji: {
            chainId: "0xA869",
            chainName: "Avalanche Testnet C-Chain",
            nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
            rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            blockExplorerUrls: ["https://testnet.snowtrace.io/"],
        },
    }

    const changeNetwork = async ({ networkName, setError }) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found")
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{ ...networks[networkName] }],
            })
        } catch (err) {
            setError(err.message)
            console.log(err)
        }
    }

    const handleNetworkSwitch = async (networkName) => {
        setError()
        await changeNetwork({ networkName, setError })
    }

    const setError = (error) => {
        if (error) console.error("Error:", error)
    }

    const getChainId = async () => {
        if (isActive) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const network = await provider.getNetwork()
            const _chainId = network.chainId.toString()
            setChainId(_chainId)
        }
    }

    async function getUsdToAvax() {
        if (totalUSD) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(donationBoxAddress, DonationBoxAbi, provider)
            try {
                const _totalAvax = (await contract.usdToAvax(totalUSD)).toString()
                setTotalAvax(_totalAvax)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function getTotalDonation() {
        if (isActive && account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(donationBoxAddress, DonationBoxAbi, provider)
            try {
                const _totalDonation = await contract.getTotalDonations(account)
                setTotalDonation(ethers.utils.formatUnits(_totalDonation, 6))
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function donate() {
        setIsLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(donationBoxAddress, DonationBoxAbi, signer)
        try {
            const transactionResponse = await contract.donate({ value: totalAvax })
            await listenForTransactionMine(transactionResponse, provider)
            await getTotalDonation()
        } catch (error) {
            setIsLoading(false)
        }
    }

    function listenForTransactionMine(transactionResponse, provider) {
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    setIsLoading(false)
                    resolve()
                })
            } catch (error) {
                setIsLoading(false)
                reject(error)
            }
        })
    }

    async function updateUI() {
        getChainId()
        getUsdToAvax()
        getTotalDonation()
    }

    useEffect(() => {
        updateUI()
    }, [isActive, totalUSD])

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center">
            {isActive && chainId == "43113" ? (
                <div className="flex flex-col justify-center items-center space-y-6">
                    <p className="text-2xl font-semibold">Donate</p>

                    <p className="text-lg text-gray-300">
                        Total Donated: {totalDonation ? `$${totalDonation}` : "Loading..."} USD
                    </p>

                    <input
                        placeholder="Enter the dollar amount you want to donate."
                        className="border-2 border-gray-600 bg-gray-800 text-white w-[400px] max-w-xl px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-400"
                        value={totalUSD}
                        onChange={(e) => setTotalUSD(e.target.value)}
                    />

                    <button
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-md"
                        onClick={() => donate()}
                    >
                        {isLoading ? (
                            <div className="animate-spin h-6 w-6 border-2 border-b-0 rounded-full border-white"></div>
                        ) : (
                            "Send"
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center text-center space-y-6 mt-10">
                    <div className="text-2xl">Please switch to the Avalanche Fuji C-Chain and connect to a wallet.</div>
                    <button
                        onClick={() => handleNetworkSwitch("fuji")}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-md"
                    >
                        Switch to Avalanche Fuji C-Chain
                    </button>
                </div>
            )}
        </div>
    )
}
