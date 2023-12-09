import { Connect } from "./connect"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-10 flex flex-row justify-between items-center bg-blue-600">
            <div className="flex items-center">
                <img src="/logo.png" className="my-auto h-20 w-20 ml-5" />
                <h1 className="font-orbitron py-4 px-4 font-bold text-4xl ml-5">Freedom Doves</h1>
            </div>
            <div className="flex flex-row items-center">
                <Link href="/" legacyBehavior>
                    <a className="bg-gray-800 hover:bg-gray-700 h-12 text-white font-bold py-2 mr-4 px-4 rounded-lg ml-auto flex items-center ">
                        Home
                    </a>
                </Link>
                <Link href="/donation-box" legacyBehavior>
                    <a className="bg-gray-800 hover:bg-gray-700 h-12 text-white font-bold py-2 mr-4 px-4 rounded-lg ml-auto flex items-center">
                        Donation box
                    </a>
                </Link>
                <Connect />
            </div>
        </nav>
    )
}
