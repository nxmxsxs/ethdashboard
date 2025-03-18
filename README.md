# Simple Ethereum Wallet Manager Contract

A simple web app that interfaces with a smart contract for managing wallets

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Build Instructions](#build-instructions)
- [Usage](#usage)

## Requirements

- [Node.js](https://nodejs.org/) v18.x or higher
- [Foundry](https://getfoundry.sh/)
- A modern web browser (Chrome, Firefox, etc.) with a EIP-1193 compliant extension
installed (Recommended: [Metamask](https://metamask.io/download))

## Installation

1. Clone the repository:

```sh
git clone --recurse-submodules https://github.com/nxmxsxs/ethdashboard
```

2. Navigate to the project directory:

```sh
cd ethdashboard
```

3. Install dependencies:

```sh
pnpm install
```

## Build Instructions

```sh
pnpm contracts:compile
```

## Usage

- Edit `.env` with the following:
```
VITE_ANVIL_USER_WALLET_MGR_PROXY='0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
```

- Terminal 1 - Start local ethereum network
```sh
anvil --state state.json
```

This will start a local ethereum network with some preconfigured test wallets

- Terminal 2 - Start web development server
```sh
pnpm dev
```

- Open web browser and navigate to `localhost:5173`

- Import wallets into metamask and interact with the smart contract via the web interface
