# GamerTokenHub - NFT Marketplace Frontend

A modern, responsive frontend for the GamerTokenHub NFT marketplace built with Next.js, Tailwind CSS, and ethers.js.

## Features

- Create and manage NFT collections
- Mint NFTs with custom metadata
- List NFTs for sale with custom pricing
- Browse and purchase NFTs
- User profiles with owned NFTs and collections
- Wishlist and shopping cart functionality
- Responsive design for all devices

## Tech Stack

- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **ethers.js**: Ethereum library for blockchain interactions
- **RainbowKit**: Wallet connection UI
- **Framer Motion**: Animation library
- **React Hook Form**: Form handling with Zod validation
- **IPFS/Pinata**: Decentralized storage for NFT metadata and images

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blockchain-assignment/blockchain-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=
   NEXT_PUBLIC_ETHERSCAN_API_KEY=
   NEXT_PUBLIC_PINATA_API_KEY=
   PINATA_SECRET_API_KEY=
   NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=
   NEXT_PUBLIC_PINATA_JWT=
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```
   
   Alternatively, connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

- `app/`: Next.js app directory with pages and routes
- `components/`: Reusable UI components
- `contexts/`: React context providers
- `hooks/`: Custom React hooks
- `lib/`: Utility libraries and configurations
- `public/`: Static assets
- `type/`: TypeScript type definitions
- `utils/`: Helper functions

## Live Demo

The application is currently deployed at: [http://gamertokenhub.vercel.app/](http://gamertokenhub.vercel.app/)

**Note:** The marketplace currently operates only on the Sepolia testnet, not on mainnet.