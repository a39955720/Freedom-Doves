# Freedom Doves

## Link:
- Live Demo Fleek: https://black-cell-9064.on.fleek.co/
- Fake USDC: https://testnet.snowtrace.io/token/0xcc51294451EEC7373000Fd7Ea0F5eBcA09Bda0EA
- Admin NFT: https://testnet.snowtrace.io/address/0xC714490B883bd62b228439DD9C7e314Ce8504852
- Donation Box: https://testnet.snowtrace.io/address/0xeAB21Bf0da78C6bfe0b5D725899311D34E4db3D0
- Freedom Doves: https://testnet.snowtrace.io/address/0xF69cBC65285A367E97D8dbEd8f6a168617C34b2B


## Project Description:
Drawing inspiration from the thought-provoking themes of "freedom" and "peace" explored in the popular anime series "Attack on Titan," I embarked on a creative journey during a hackathon to develop a decentralized forum akin to Reddit. This unique platform distinguishes itself by curating a collection of articles that revolve exclusively around the concepts of "freedom" and "peace." To ensure the utmost relevance, each article undergoes meticulous AI moderation, guaranteeing alignment with these overarching themes.

In an effort to foster engagement and recognize exceptional contributions, we hold a weekly selection process where the top three articles, as determined by the number of likes, are chosen. As a token of appreciation, the authors of these distinguished pieces are rewarded with a random allocation of USDC (a stablecoin) and an exclusive Admin NFT (Non-Fungible Token). With the possession of an Admin NFT, users are bestowed with the authority to remove posts that have eluded the AI's moderation process. Should a deletion request be submitted by a majority of Admin NFT holders, the post in question will be promptly removed, maintaining the forum's commitment to quality content.

Moreover, we empower our community members to go beyond passive engagement by providing them with an avenue to take meaningful action. After immersing themselves in the thought-provoking articles, users are encouraged to visit the dedicated Donation Box page, where they can contribute funds to organizations dedicated to championing the ideals of freedom and peace. This feature allows individuals to translate their resonance with the content into tangible support for initiatives that align with their values.

Through this innovative platform, I aim to create a space where individuals can explore, discuss, and promote the fundamental principles of "freedom" and "peace" in a dynamic and engaging manner.

## How it's Made:
1. The core contract of the project is implemented in Solidity, using Foundry as the development framework. Foundry provides tools for contract compilation, deployment, and unit testing.

2. Implement Chainlink Automation to automate the weekly rewards for the top three posts with the highest number of likes.

3. Utilize Chainlink VRF to introduce randomness in the amount of USDC received by the top three winners.

4. Incorporate Chainlink Price Feed to enable users to convert the inputted amount in USD to AVAX.

5. Leverage OpenAI's gpt-3.5-turbo for efficient article review and moderation.

6. Develop the frontend using Next.js.

7. Utilize Tailwind CSS for streamlined styling and layout design.

8. Deploy the website using Fleek as the deployment tool for seamless hosting and maintenance.

9. Deploy the contract on Avalanche Fuji C-Chain and integrate the Core wallet into the frontend.

## Potential Future Enhancements:
1. Enhance the security of the smart contract by adding comprehensive unit tests.

2. Improve the AI's ability to review and moderate posts effectively.

3. Enhance the UI/UX to provide a better user experience.
