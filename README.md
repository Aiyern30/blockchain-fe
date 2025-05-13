# 🖼️ NFT Marketplace DApp (Full Blockchain System)

This is a fully functional **NFT Marketplace DApp** that allows users to create, list, buy, sell, relist, burn, and manage NFTs. The platform supports user profiles, collections, wishlists, cart systems, and transaction histories — providing a complete decentralized marketplace experience.

---

## ✨ Key Features

### 🏠 General Pages

- ✅ Connect Wallet (RainbowKit, Web3Auth)
- ✅ Homepage & Explore Page
- ✅ Contact Us Page

### 🧑 User Profile

- ✅ View own profile & other user profiles
- ✅ Show wallet address, joined date (from first transaction)
- ✅ Tabs: Collections, Cart, Wishlist, Transaction History
- ✅ Filter & switch grid/list view for NFTs

### 🎨 NFT Collections

- ✅ Create Collection (with inputs & validations)
- ✅ View created Collections (own & others)
- ✅ List NFTs into Collections
- ✅ View listed NFTs from collections
- ✅ Empty state handling (no NFTs scenario)

### 🖼️ NFT Actions

- ✅ Create NFT (upload to IPFS, set metadata)
- ✅ Buy NFT (with confirmation & validations)
- ✅ Burn own NFT
- ✅ Relist NFT (with gas fee confirmation)
- ✅ Prevent buying own created NFTs (validation)

### 🛒 Wishlist & Cart

- ✅ Add/Remove NFTs to/from Wishlist
- ✅ Add/Remove NFTs to/from Cart
- ✅ View Wishlist & Cart pages (own user)
- ✅ Cart empty state handling
- ✅ Buy NFTs from Cart

### 🔄 Transactions

- ✅ Fetch transaction history (via Etherscan API)
- ✅ View personal transactions in Profile page
- ✅ Transaction confirmation dialogs
- ✅ Cancel transaction flows

### 📄 NFT Details

- ✅ View NFT card details (listed NFTs)
- ✅ Click card to open NFT details page

---

## 🛠️ Tech Stack

| Tech                   | Usage                                 |
| ---------------------- | ------------------------------------- |
| **Next.js**            | Frontend (App Router)                 |
| **TypeScript**         | Type Safety                           |
| **Tailwind CSS**       | UI Styling                            |
| **shadcn/ui**          | Modern UI Components                  |
| **Wagmi + RainbowKit** | Wallet Connection (Web3Auth fallback) |
| **Etherscan API**      | Transaction History Fetching          |
| **IPFS (via Pinata)**  | NFT Media & Metadata Storage          |
| **Lucide React**       | Icon Library                          |

---

## 📝 User Flow

1. Connect wallet → View Homepage & Explore NFTs
2. Create Collections → Create & List NFTs
3. Browse NFTs → Add to Wishlist or Cart
4. Purchase NFTs → Confirm & handle transactions
5. Manage Profile → View own collections, cart, wishlist, transaction history
6. Relist, Burn, or View NFT details
7. Other users can view collections but cannot edit others' NFTs

## 🚀 Getting Started (Local)

```bash
# Clone the repository
git clone https://github.com/Aiyern30/blockchain-fe.git

# Install dependencies
npm install

# Run the development server
npm run dev
```
