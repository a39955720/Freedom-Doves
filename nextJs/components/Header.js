import { Connect } from "./connect"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-4 border-b border-gray-700 flex justify-between items-center bg-black">
            <div className="flex items-center">
                <img src="/logo.png" className="h-16 w-16 ml-4" alt="Logo" />
                <h1 className="font-orbitron text-white font-bold text-3xl ml-4">Freedom Doves</h1>
            </div>
            <div className="flex items-center space-x-4">
                <Link href="/" legacyBehavior>
                    <a className="bg-blue-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center transition">
                        Home
                    </a>
                </Link>
                <Link href="/donation-box" legacyBehavior>
                    <a className="bg-blue-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center transition">
                        Donation Box
                    </a>
                </Link>
                <Connect />
            </div>
        </nav>
    )
}
