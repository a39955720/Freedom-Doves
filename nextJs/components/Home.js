import { useWeb3ConnectionContext } from "../context/web3Connection.context"
import { FreedomDovesAbi } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Home() {
    const { connector, useIsActive, useAccount } = useWeb3ConnectionContext()
    const [totalPost, setTotalPost] = useState("0")
    const [chainId, setChainId] = useState("0")
    const [error, setError] = useState()
    const isActive = useIsActive()
    const activeAccount = useAccount()
    const freedomDovesAddress = "0x851af51305de3f184d1a12601907c1b7fe81eb83"

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

    async function getTotalPost() {
        if (isActive) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
            try {
                const _totalPost = (await contract.getTotalPost()).toString()
                setTotalPost(_totalPost)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function updateUI() {
        getTotalPost()
        getChainId()
        console.log(chainId)
    }

    useEffect(() => {
        updateUI()
    }, [isActive, totalPost])

    return (
        <div className="flex mt-10">
            {isActive && chainId == "43113" ? (
                <div className="ml-10 flex flex-row w-full">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded mr-10 w-full"
                        onClick={async function () {}}
                    >
                        Create a post
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
