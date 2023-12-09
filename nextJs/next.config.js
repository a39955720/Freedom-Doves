const dotenv = require("dotenv")
dotenv.config()

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    reactStrictMode: true,
    // env: {
    //     OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // },
}

module.exports = nextConfig
