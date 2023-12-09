import { useWeb3ConnectionContext } from "../context/web3Connection.context"
import { DonationBoxAbi } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function DonationBox() {
    const { useIsActive, useAccount } = useWeb3ConnectionContext()
    const [chainId, setChainId] = useState("0")
    const [totalUSD, setTotalUSD] = useState("")
    const [totalAvax, setTotalAvax] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const isActive = useIsActive()
    const donationBoxAddress = "0xeAB21Bf0da78C6bfe0b5D725899311D34E4db3D0"

    const networks = {
        fuji: {
            chainId: "0xA869",
            chainName: "Avalanche Testnet C-Chain",
            nativeCurrency: {
                name: "Avalanche",
                symbol: "AVAX",
                decimals: 18,
            },
            rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            blockExplorerUrls: ["https://testnet.snowtrace.io/"],
        },
    }

    const changeNetwork = async ({ networkName, setError }) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found")
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        ...networks[networkName],
                    },
                ],
            })
        } catch (err) {
            setError(err.message)
            console.log(error)
        }
    }

    const handleNetworkSwitch = async (networkName) => {
        setError()
        await changeNetwork({ networkName, setError })
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

    async function donate() {
        setIsLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(donationBoxAddress, DonationBoxAbi, signer)
        try {
            const transactionResponse = await contract.donate({
                value: totalAvax,
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            setIsLoading(false)
        }
    }

    function listenForTransactionMine(transactionResponse, provider) {
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    setIsLoading(false)
                })
            } catch (error) {
                setIsLoading(false)
            }
        })
    }

    async function updateUI() {
        getChainId()
        getUsdToAvax()
    }

    useEffect(() => {
        updateUI()
        updateUI()
    }, [isActive, totalUSD])

    return (
        <div>
            {isActive && chainId == "43113" ? (
                <div className="flex justify-center items-center h-screen">
                    <p class="text-black text-xl mt-5 mr-5 mb-20">Donate:</p>
                    <input
                        placeholder="Enter the dollar amount you want to donate."
                        className="border-2 border-blue-500 w-1/4 mt-5 px-4 py-3 mb-20 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                        value={totalUSD}
                        onChange={(e) => setTotalUSD(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded mb-14 ml-5"
                        onClick={() => donate()}
                    >
                        {isLoading ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Send"
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-start mt-10">
                    <div className="ml-10 text-xl">
                        Please switch to the Avalanche Fuji C-Chain and connect to a wallet.
                    </div>
                    <div class="flex">
                        <button
                            onClick={() => {
                                handleNetworkSwitch("fuji")
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-10 mt-10"
                        >
                            Switch to Avalanche Fuji C-Chain
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
