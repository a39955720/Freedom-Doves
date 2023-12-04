import { useWeb3ConnectionContext } from "../context/web3Connection.context"
import { FreedomDovesAbi } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import OpenAI from "openai"

export default function Home() {
    const { useIsActive, useAccount } = useWeb3ConnectionContext()
    const [totalPost, setTotalPost] = useState("0")
    const [chainId, setChainId] = useState("0")
    const [error, setError] = useState()
    const [showModal_1, setShowModal_1] = useState(false)
    const [showModal_2, setShowModal_2] = useState(false)
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [results, setResults] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const abi = ethers.utils.defaultAbiCoder
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true })
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
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
        try {
            const _totalPost = (await contract.getTotalPost()).toString()
            setTotalPost(_totalPost)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    async function newPost() {
        const abiEncodeTitle = abi.encode(["string"], [title])
        const abiEncodeText = abi.encode(["string"], [text])
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.newPost(abiEncodeTitle, abiEncodeText)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            setResults(error)
            setIsLoading(false)
        }
    }

    function listenForTransactionMine(transactionResponse, provider) {
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    setResults("Successfully added a new post.")
                    setShowModal_2(true)
                    setIsLoading(false)
                    setShowModal_1(false)
                    resolve()
                })
            } catch (error) {
                setResults(error)
                setShowModal_2(true)
                setIsLoading(false)
                reject(error)
            }
        })
    }

    async function creatPost() {
        setIsLoading(true)
        const completion1 = await openai.chat.completions.create({
            messages: [
                {
                    role: "assistant",
                    content:
                        "Does this title include freedom or peace? If yes, answer true; otherwise, answer false: " +
                        title,
                },
            ],
            model: "gpt-3.5-turbo",
            max_tokens: 1,
        })

        const completion2 = await openai.chat.completions.create({
            messages: [
                {
                    role: "assistant",
                    content:
                        "Does this article include freedom or peace? If yes, answer true; otherwise, answer false: " +
                        text,
                },
            ],
            model: "gpt-3.5-turbo",
            max_tokens: 1,
        })

        if (
            completion1.choices[0].message.content.toLowerCase() == "true" &&
            completion2.choices[0].message.content.toLowerCase() == "true"
        ) {
            newPost()
        } else {
            setResults(
                "Your Title or Text has been detected by AI as not including freedom or peace. Please make the necessary adjustments and try again.",
            )
            setShowModal_2(true)
            setIsLoading(false)
        }

        console.log(completion1.choices[0].message.content)
        console.log(completion2.choices[0].message.content)
    }

    async function updateUI() {
        getTotalPost()
        getChainId()
    }

    useEffect(() => {
        updateUI()
    }, [isActive])

    return (
        <div className="flex mt-10">
            {isActive && chainId == "43113" ? (
                <div className="ml-10 flex flex-row w-full">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded mr-10 w-full"
                        onClick={() => setShowModal_1(true)}
                    >
                        Create a post
                    </button>
                    {showModal_1 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                            <div className="bg-white p-5 rounded w-3/4 bg-gray-200  min-h-screen ">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="border-2 border-blue-500 w-full mt-5 px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    className="border-2 border-blue-500 w-full h-3/4 mt-10 px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                                    value={text}
                                    placeholder="Text"
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <div className="flex mt-4 justify-center">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                        onClick={() => creatPost()}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                                        ) : (
                                            "Post"
                                        )}
                                    </button>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white ml-5 font-bold py-2 px-4 rounded"
                                        onClick={() => setShowModal_1(false)}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                                        ) : (
                                            "Close"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showModal_2 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-5 rounded">
                                <h2 className="text-2xl mb-4">{results}</h2>
                                <div className="flex mt-4 justify-center">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => setShowModal_2(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
