import { FreedomDovesAbi } from "../constants"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import OpenAI from "openai"

export default function Home() {
    const { isWeb3Enabled, chainId: chainIdHex, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const [totalPost, setTotalPost] = useState("0")
    const [totalComment, setTotalComment] = useState("0")
    const [error, setError] = useState()
    const [showModal_1, setShowModal_1] = useState(false)
    const [showModal_2, setShowModal_2] = useState(false)
    const [showModal_3, setShowModal_3] = useState(false)
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [comment, setComment] = useState("")
    const [results, setResults] = useState("")
    const [currentId, setCurrentId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isLoading1, setIsLoading1] = useState(false)
    const [isLoading2, setIsLoading2] = useState(false)
    const [isLoading3, setIsLoading3] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [canVote, setCanVote] = useState(false)
    const [_title, setTitles] = useState([])
    const [_content, setContents] = useState([])
    const [_authors, setAuthors] = useState([])
    const [_like, setLike] = useState([])
    const [_comment, setComments] = useState([])
    const [_commenter, setCommenter] = useState([])
    const abi = ethers.utils.defaultAbiCoder
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true })
    const cards = []
    const cards1 = []

    const freedomDovesAddress = () => {
        switch (chainId) {
            case 11155420:
                return "0x2b1099443d9e23b4a0928ee0d050f64924f9d0a2"
                break
            case 59140:
                return "0x2b1099443d9e23b4a0928ee0d050f64924f9d0a2"
                break
            case 534351:
                return "0x0416544203031b0cb7b99c0aba0d2d3ea7a62154"
                break
            case 18:
                return "0x2b1099443d9e23b4a0928ee0d050f64924f9d0a2"
                break
            case 48899:
                return "0xca1b22cb75594c94ba231993a70ac6e91a6b5f89"
                break
        }
    }

    const networks = {
        zircuit: {
            chainId: "0xBF03",
            chainName: "Zircuit",
            nativeCurrency: {
                name: "Zircuit1",
                symbol: "ETH",
                decimals: 18,
            },
            rpcUrls: ["https://zircuit1.p2pify.com/"],
            blockExplorerUrls: ["https://explorer.zircuit.com"],
        },
        thundercore: {
            chainId: "0x12",
            chainName: "ThunderCore Testnet",
            nativeCurrency: {
                name: "ThunderCore",
                symbol: "ETH",
                decimals: 18,
            },
            rpcUrls: ["https://testnet-rpc.thundercore.com"],
            blockExplorerUrls: ["https://explorer-testnet.thundercore.com/"],
        },
        scroll: {
            chainId: "0x8274F",
            chainName: "Scroll Sepolia Testnet",
            nativeCurrency: {
                name: "Scroll",
                symbol: "ETH",
                decimals: 18,
            },
            rpcUrls: ["https://sepolia-rpc.scroll.io/"],
            blockExplorerUrls: ["https://sepolia-blockscout.scroll.io"],
        },
        optimism: {
            chainId: "0xAA37DC",
            chainName: "OP Sepolia",
            nativeCurrency: {
                name: "Optimism",
                symbol: "ETH",
                decimals: 18,
            },
            rpcUrls: ["https://sepolia.optimism.io"],
            blockExplorerUrls: ["https://sepolia-optimistic.etherscan.io"],
        },
        linea: {
            chainId: "0xE704",
            chainName: "Linea Goerli Testnet",
            nativeCurrency: {
                name: "Linea",
                symbol: "ETH",
                decimals: 18,
            },
            rpcUrls: ["https://rpc.goerli.linea.build"],
            blockExplorerUrls: ["https://goerli.lineascan.build/"],
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

    async function getTotalPost() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
        try {
            const _totalPost = (await contract.getTotalPost()).toString()
            setTotalPost(_totalPost)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    async function getPostData() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
        try {
            const titles = []
            const contents = []
            const authors = []
            const totleLike = []
            for (let i = totalPost - 1; i >= 1; i--) {
                const postData = await contract.getPostData(i)
                const decodedTitle = abi.decode(["string"], postData[0])
                const decodedContent = abi.decode(["string"], postData[1])
                titles[i] = decodedTitle.toString()
                contents[i] = decodedContent.toString()
                authors[i] = postData[2].toString()
                totleLike[i] = postData[5].toString()
            }
            setTitles(titles)
            setContents(contents)
            setAuthors(authors)
            setLike(totleLike)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    async function getTotalComment() {
        if (currentId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
            try {
                const _totalComment = (await contract.getTotalComment(currentId)).toString()
                setTotalComment(_totalComment)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function getCommentData() {
        if (totalComment) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
            try {
                const comments = []
                const commenter = []
                for (let i = 0; i < totalComment; i++) {
                    const commentData = await contract.getCommentData(currentId, i)
                    const decodedComment = abi.decode(["string"], commentData[0])
                    comments[i] = decodedComment.toString()
                    commenter[i] = commentData[1].toString()
                    console.log("aa")
                }
                setComments(comments)
                setCommenter(commenter)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function newPost() {
        const abiEncodeTitle = abi.encode(["string"], [title])
        const abiEncodeText = abi.encode(["string"], [text])
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.newPost(abiEncodeTitle, abiEncodeText)
            const str = "Successfully added a new post."
            await listenForTransactionMine(transactionResponse, provider, str)
        } catch (error) {
            setResults(error)
            setIsLoading(false)
        }
    }

    async function likePost() {
        setIsLoading1(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.likePost(currentId)
            const str = "Successfully like post."
            await listenForTransactionMine(transactionResponse, provider, str)
        } catch (error) {
            setResults(error)
            setIsLoading1(false)
        }
    }

    async function deletePost() {
        setIsLoading2(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.deletePost(currentId)
            const str = "Successfully voted to delete."
            await listenForTransactionMine(transactionResponse, provider, str)
        } catch (error) {
            setResults(error)
            setIsLoading2(false)
        }
    }

    async function newComment() {
        setIsLoading3(true)
        const abiEncodeComment = abi.encode(["string"], [comment])
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.newComment(currentId, abiEncodeComment)
            const str = "Successfully added a new comment."
            await listenForTransactionMine(transactionResponse, provider, str)
        } catch (error) {
            setResults(error)
            setIsLoading3(false)
        }
    }

    async function getIsLiked() {
        if (currentId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
            try {
                const _isLiked = await contract.getIsLiked(account, currentId)
                setIsLiked(_isLiked)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function getIsDeleted() {
        if (currentId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
            try {
                const _isDeleted = await contract.getIsDeleted(currentId)
                setIsDeleted(_isDeleted)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function getCanVote() {
        if (currentId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress(), FreedomDovesAbi, provider)
            try {
                const _canVote = await contract.getCanVote(account, currentId)
                setCanVote(_canVote)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    function listenForTransactionMine(transactionResponse, provider, str) {
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    setResults(str)
                    setShowModal_2(true)
                    setIsLoading(false)
                    setIsLoading1(false)
                    setIsLoading2(false)
                    setIsLoading3(false)
                    setShowModal_1(false)
                    setShowModal_3(false)
                    resolve()
                })
            } catch (error) {
                setResults(error)
                setShowModal_2(true)
                setIsLoading(false)
                setIsLoading1(false)
                setIsLoading2(false)
                setIsLoading3(false)
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
    }

    const handleClick = (i) => {
        setCurrentId(i)
        setShowModal_3(true)
    }

    for (let i = totalPost - 1; i >= 1; i--) {
        if (_title[i]) {
            cards.push(
                <div
                    className="w-full mt-5 bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-300 ease-in-out transform hover:bg-gray-200 hover:shadow-lg"
                    onClick={() => handleClick(i)}
                >
                    <div class="flex flex-col">
                        <h3 class="text-xl font-semibold">{_title[i]}</h3>
                        <p class="text-gray-600 mt-2">{_content[i].substring(0, 200) + "..."}</p>
                    </div>
                </div>,
            )
        }
    }

    for (let i = 0; i < totalComment; i++) {
        if (_comment[i]) {
            cards1.push(
                <div className="bg-gray-200 mt-5 rounded-lg shadow-md p-4 w-full">
                    <div class="flex flex-col">
                        <p class="text-gray-500 font-semibold">{_commenter[i]}</p>
                        <p class="text-black text-lg">{_comment[i]}</p>
                    </div>
                </div>,
            )
        }
    }

    async function updateUI() {
        getTotalPost()
        getTotalComment()
        getPostData()
        getCommentData()
        getIsLiked()
        getCanVote()
        getIsDeleted()
    }

    useEffect(() => {
        updateUI()
    }, [isWeb3Enabled, totalPost, totalComment, showModal_1, showModal_2, showModal_3])

    return (
        <div className="flex mt-10">
            {isWeb3Enabled &&
            (chainId == "11155420" ||
                chainId == "59140" ||
                chainId == "534351" ||
                chainId == "18" ||
                chainId == "48899") ? (
                <div className="ml-10 mr-10 flex flex-col w-full">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded mr-10 w-full"
                        onClick={() => setShowModal_1(true)}
                    >
                        Create a post
                    </button>
                    <div className="flex flex-wrap mt-5">{cards}</div>
                    {showModal_1 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                            <div className="bg-white p-5 rounded w-3/4 bg-gray-200 h-screen overflow-y-scroll">
                                <input
                                    placeholder="Title"
                                    className="border-2 border-blue-500 w-full mt-5 px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Text"
                                    className="border-2 border-blue-500 w-full h-3/4 mt-10 px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                                    value={text}
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
                    {showModal_3 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                            <div className="bg-white p-5 rounded w-3/4 bg-gray-200 h-screen overflow-y-scroll">
                                <button
                                    className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded"
                                    style={{ float: "right" }}
                                    onClick={() => setShowModal_3(false)}
                                >
                                    X
                                </button>
                                <h1 class="text-3xl font-semibold mt-5">{_title[currentId]}</h1>
                                <h3 class="text-black text-xl mt-5">Authors:{_authors[currentId]}</h3>
                                <p class="text-black text-xl mt-5" style={{ whiteSpace: "pre-wrap" }}>
                                    {_content[currentId]}
                                </p>
                                <div className="mt-10">
                                    {!isLiked && !isDeleted ? (
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                            onClick={() => likePost()}
                                        >
                                            {isLoading1 ? (
                                                <div className="animate-spin spinner-border h-5 w-5 border-b-2 rounded-full"></div>
                                            ) : (
                                                <>LIKE&nbsp;&nbsp;{_like[currentId]}</>
                                            )}
                                        </button>
                                    ) : (
                                        <box className="bg-gray-500 text-white mr-5 font-bold py-2 px-4 rounded">
                                            LIKE {"\u00A0"}
                                            {"\u00A0"}
                                            {_like[currentId]}
                                        </box>
                                    )}
                                    {canVote ? (
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                            onClick={() => deletePost()}
                                        >
                                            {isLoading2 ? (
                                                <div className="animate-spin spinner-border h-5 w-5 border-b-2 rounded-full"></div>
                                            ) : (
                                                <>DELETE</>
                                            )}
                                        </button>
                                    ) : (
                                        <box className="bg-gray-500 text-white mr-5 font-bold py-2 px-4 rounded">
                                            DELETE
                                        </box>
                                    )}
                                </div>
                                <textarea
                                    className="mt-10 border-2 border-blue-500 w-full px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                                    value={comment}
                                    placeholder="Write a new comment."
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                {!isDeleted ? (
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                        style={{ float: "right" }}
                                        onClick={() => newComment()}
                                    >
                                        {isLoading3 ? (
                                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                                        ) : (
                                            <>COMMENT</>
                                        )}
                                    </button>
                                ) : (
                                    <box
                                        className="bg-gray-500 text-white mr-5 font-bold py-2 px-4 rounded"
                                        style={{ float: "right" }}
                                    >
                                        COMMENT
                                    </box>
                                )}
                                <h1 class="text-xl font-semibold mt-10">
                                    Comment {"\u00A0"}
                                    {"\u00A0"}
                                    {totalComment}
                                </h1>
                                <div className="flex flex-wrap">{cards1}</div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-start mt-10">
                    <div className="ml-10 text-xl">Please connect to a wallet and switch to the following chain.</div>
                    <div class="flex">
                        <button
                            onClick={() => {
                                handleNetworkSwitch("optimism")
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-10 mt-10"
                        >
                            OP Sepolia
                        </button>
                        <button
                            onClick={() => {
                                handleNetworkSwitch("linea")
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-10 mt-10"
                        >
                            Linea Goerli Testnet
                        </button>
                        <button
                            onClick={() => {
                                handleNetworkSwitch("scroll")
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-10 mt-10"
                        >
                            Scroll Sepolia Testnet
                        </button>
                        <button
                            onClick={() => {
                                handleNetworkSwitch("thundercore")
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-10 mt-10"
                        >
                            ThunderCore Testnet
                        </button>
                        <button
                            onClick={() => {
                                handleNetworkSwitch("zircuit")
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-10 mt-10"
                        >
                            Zircuit Testnet
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
