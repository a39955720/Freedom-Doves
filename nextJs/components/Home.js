import { useWeb3ConnectionContext } from "../context/web3Connection.context"
import { FreedomDovesAbi } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import OpenAI from "openai"

export default function Home() {
    const { useIsActive, useAccount } = useWeb3ConnectionContext()
    const [totalPost, setTotalPost] = useState("0")
    const [totalComment, setTotalComment] = useState("0")
    const [chainId, setChainId] = useState("0")
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
    const [_title, setTitles] = useState([])
    const [_content, setContents] = useState([])
    const [_authors, setAuthors] = useState([])
    const [_like, setLike] = useState([])
    const [_comment, setComments] = useState([])
    const [_commenter, setCommenter] = useState([])
    const abi = ethers.utils.defaultAbiCoder
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true })
    const isActive = useIsActive()
    const cards = []
    const cards1 = []
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

    async function getPostData() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
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
            const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
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
            const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
            try {
                const comments = []
                const commenter = []
                for (let i = 0; i < totalComment - 1; i++) {
                    const commentData = await contract.getCommentData(currentId, i)
                    const decodedComment = abi.decode(["string"], commentData[0])
                    comments[i] = decodedComment.toString()
                    commenter[i] = commentData[1].toString()
                    console.log(comments[i])
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
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
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
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.likePost(currentId)
            const str = "Successfully like post."
            await listenForTransactionMine(transactionResponse, provider, str)
        } catch (error) {
            setResults(error)
            setIsLoading(false)
        }
    }

    async function newComment() {
        const abiEncodeComment = abi.encode(["string"], [comment])
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
        try {
            const transactionResponse = await contract.newComment(currentId, abiEncodeComment)
            const str = "Successfully added a new comment."
            await listenForTransactionMine(transactionResponse, provider, str)
        } catch (error) {
            setResults(error)
            setIsLoading(false)
        }
    }

    function listenForTransactionMine(transactionResponse, provider, str) {
        return new Promise((resolve, reject) => {
            try {
                provider.once(transactionResponse.hash, (transactionReceipt) => {
                    setResults(str)
                    setShowModal_2(true)
                    setIsLoading(false)
                    setShowModal_1(false)
                    setShowModal_3(false)
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

    const handleClick = (i) => {
        setCurrentId(i)
        setShowModal_3(true)
    }

    for (let i = totalPost - 1; i >= 1; i--) {
        if (_title[i]) {
            cards.push(
                <div
                    className="mt-5 bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-300 ease-in-out transform hover:bg-gray-200 hover:shadow-lg"
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

    for (let i = 0; i < totalComment[currentId]; i++) {
        if (_comment[i]) {
            cards1.push(
                <div className="mt-5 bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-300 ease-in-out transform hover:bg-gray-200 hover:shadow-lg">
                    <div class="flex flex-col">
                        <h3 class="text-xl font-semibold">{_commenter[i]}</h3>
                        <p class="text-gray-600 mt-2">{_comment[i]}</p>
                    </div>
                </div>,
            )
            console.log("a")
        }
    }

    async function updateUI() {
        getTotalPost()
        getTotalComment()
        getPostData()
        getChainId()
        getCommentData()
    }

    async function updateUI1() {
        getTotalComment()
    }

    useEffect(() => {
        updateUI()
    }, [isActive, totalPost, showModal_1, showModal_2, showModal_3])

    useEffect(() => {
        updateUI1()
    }, [isActive, showModal_3])

    return (
        <div className="flex mt-10">
            {isActive && chainId == "43113" ? (
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
                    {showModal_3 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                            <div className="bg-white p-5 rounded w-3/4 bg-gray-200 min-h-screen">
                                <button
                                    className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded"
                                    style={{ float: "right" }}
                                    onClick={() => setShowModal_3(false)}
                                >
                                    X
                                </button>
                                <h1 class="text-xl font-semibold mt-5">{_title[currentId]}</h1>
                                <h3 class="text-gray-600 mt-5">Authors:{_authors[currentId]}</h3>
                                <p class="text-gray-600 mt-5">{_content[currentId]}</p>
                                <div className="mt-10">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                        onClick={() => likePost()}
                                    >
                                        LIKE {"\u00A0"}
                                        {"\u00A0"}
                                        {_like[currentId]}
                                    </button>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                        onClick={() => setShowModal_3(false)}
                                    >
                                        DELETE
                                    </button>
                                </div>
                                <textarea
                                    className="mt-10 border-2 border-blue-500 w-full h-3/4 px-4 py-3 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                                    value={comment}
                                    placeholder="Write a new comment."
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white mr-5 font-bold py-2 px-4 rounded"
                                    style={{ float: "right" }}
                                    onClick={() => newComment()}
                                >
                                    COMMENT
                                </button>
                                <h1 class="text-xl font-semibold mt-10">
                                    Comment {"\u00A0"}
                                    {"\u00A0"}
                                    {totalComment}
                                </h1>
                                <div className="flex flex-wrap mt-5">{cards1}</div>
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
