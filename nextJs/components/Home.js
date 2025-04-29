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
    const isActive = useIsActive()
    const cards = []
    const cards1 = []
    const activeAccount = useAccount()
    const freedomDovesAddress = "0xF69cBC65285A367E97D8dbEd8f6a168617C34b2B"

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
        setIsLoading1(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
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
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
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
        const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, signer)
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
            const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
            try {
                const _isLiked = await contract.getIsLiked(activeAccount, currentId)
                setIsLiked(_isLiked)
            } catch (error) {
                console.error("Error:", error)
            }
        }
    }

    async function getIsDeleted() {
        if (currentId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
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
            const contract = new ethers.Contract(freedomDovesAddress, FreedomDovesAbi, provider)
            try {
                const _canVote = await contract.getCanVote(activeAccount, currentId)
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
            model: "gpt-4o-mini",
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
            model: "gpt-4o-mini",
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
            const isDeletedPost = _title[i] === "This post has been deleted!"
            cards.push(
                <div
                    key={i}
                    className={`w-full mt-5 rounded-lg shadow-md p-4 cursor-pointer transition duration-300 ease-in-out transform hover:shadow-lg ${
                        isDeletedPost ? "bg-red-600 hover:bg-red-500" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => handleClick(i)}
                >
                    <div className="flex flex-col">
                        <h3 className="text-xl text-white font-semibold">{_title[i]}</h3>
                        <p className="text-gray-300 mt-2">{_content[i].substring(0, 200) + "..."}</p>
                    </div>
                </div>,
            )
        }
    }

    for (let i = 0; i < totalComment; i++) {
        if (_comment[i]) {
            cards1.push(
                <div key={i} className="bg-gray-700 mt-5 rounded-lg shadow-md p-4 w-full">
                    <div className="flex flex-col">
                        <p className="text-gray-400 font-semibold">{_commenter[i]}</p>
                        <p className="text-white text-lg mt-2">{_comment[i]}</p>
                    </div>
                </div>,
            )
        }
    }

    async function updateUI() {
        getTotalPost()
        getTotalComment()
        getPostData()
        getChainId()
        getCommentData()
        getIsLiked()
        getCanVote()
        getIsDeleted()
    }

    useEffect(() => {
        updateUI()
    }, [isActive, totalPost, totalComment, showModal_1, showModal_2, showModal_3])

    return (
        <div className="flex bg-gray-900 min-h-screen text-gray-100">
            {isActive && chainId == "43113" ? (
                <div className="mx-10 flex flex-col w-full">
                    <button
                        className="mt-10 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg mb-6 w-full"
                        onClick={() => setShowModal_1(true)}
                    >
                        Create a Post
                    </button>

                    <div className="flex flex-wrap gap-4">{cards}</div>

                    {/* Create Post Modal */}
                    {showModal_1 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 overflow-y-auto">
                            <div className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-3xl max-h-screen overflow-y-auto">
                                <input
                                    placeholder="Title"
                                    className="border-2 border-gray-600 bg-gray-900 text-white w-full mt-4 px-4 py-3 rounded focus:outline-none focus:ring focus:border-blue-400"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Text"
                                    className="border-2 border-gray-600 bg-gray-900 text-white w-full h-64 mt-6 px-4 py-3 rounded focus:outline-none focus:ring focus:border-blue-400"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <div className="flex justify-center mt-6 gap-6">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded"
                                        onClick={() => creatPost()}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin h-6 w-6 border-2 border-b-0 rounded-full border-white"></div>
                                        ) : (
                                            "Post"
                                        )}
                                    </button>
                                    <button
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded"
                                        onClick={() => setShowModal_1(false)}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin h-6 w-6 border-2 border-b-0 rounded-full border-white"></div>
                                        ) : (
                                            "Close"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result Modal */}
                    {showModal_2 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h2 className="text-2xl mb-6">{results}</h2>
                                <button
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded"
                                    onClick={() => setShowModal_2(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View Post Modal */}
                    {showModal_3 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 overflow-y-auto">
                            <div className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-4xl max-h-screen overflow-y-auto">
                                <div className="flex justify-end">
                                    <button
                                        className="text-gray-300 hover:text-white"
                                        onClick={() => setShowModal_3(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <h1 className="text-3xl font-bold mt-4">{_title[currentId]}</h1>
                                <h3 className="text-gray-400 text-xl mt-2">Authors: {_authors[currentId]}</h3>
                                <p className="text-gray-300 text-lg mt-6 whitespace-pre-wrap">{_content[currentId]}</p>

                                <div className="flex flex-wrap gap-4 mt-8">
                                    {!isLiked && !isDeleted ? (
                                        <button
                                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded"
                                            onClick={() => likePost()}
                                        >
                                            {isLoading1 ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-b-0 rounded-full border-white"></div>
                                            ) : (
                                                <>LIKE&nbsp;{_like[currentId]}</>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="bg-gray-600 text-white font-bold py-2 px-6 rounded flex items-center">
                                            LIKE&nbsp;{_like[currentId]}
                                        </div>
                                    )}

                                    {canVote ? (
                                        <button
                                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded"
                                            onClick={() => deletePost()}
                                        >
                                            {isLoading2 ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-b-0 rounded-full border-white"></div>
                                            ) : (
                                                "DELETE"
                                            )}
                                        </button>
                                    ) : (
                                        <div className="bg-gray-600 text-white font-bold py-2 px-6 rounded flex items-center">
                                            DELETE
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    className="mt-10 border-2 border-gray-600 bg-gray-900 text-white w-full px-4 py-3 rounded focus:outline-none focus:ring focus:border-blue-400"
                                    value={comment}
                                    placeholder="Write a new comment."
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                {!isDeleted ? (
                                    <button
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded float-right mt-4"
                                        onClick={() => newComment()}
                                    >
                                        {isLoading3 ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-b-0 rounded-full border-white"></div>
                                        ) : (
                                            "COMMENT"
                                        )}
                                    </button>
                                ) : (
                                    <div className="bg-gray-600 text-white font-bold py-2 px-6 rounded float-right mt-4">
                                        COMMENT
                                    </div>
                                )}

                                <h1 className="text-2xl font-bold mt-14 mb-4">Comments ({totalComment})</h1>
                                <div className="flex flex-wrap gap-4">{cards1}</div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full mt-20">
                    <div className="text-2xl text-gray-300 mb-6">
                        Please switch to the Avalanche Fuji C-Chain and connect to a wallet.
                    </div>
                    <div className="flex">
                        <button
                            onClick={() => handleNetworkSwitch("fuji")}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded"
                        >
                            Switch to Avalanche Fuji C-Chain
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
