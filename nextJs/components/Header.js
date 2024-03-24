import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-10 flex flex-row justify-between items-center bg-blue-600">
            <div className="flex items-center">
                <img src="/logo.png" className="my-auto h-20 w-20 ml-5" />
                <h1 className="font-orbitron py-4 px-4 font-bold text-4xl ml-5">Freedom Doves</h1>
            </div>

            <ConnectButton moralisAuth={false} />
        </nav>
    )
}
