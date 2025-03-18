// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {console} from "forge-std/console.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {Wallet} from "../contracts/UserWalletMgrV1.sol";


/// @custom:oz-upgrades-from UserWalletMgrV1
contract UserWalletMgrV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // Events
    event WalletCreated(address indexed user, address walletAddress);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event DataStored(address indexed user, string ipfsCid);

    // Structures
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    // Mappings
    mapping(address => address) public userWallets;
    mapping(address => uint256) public walletBalances;
    mapping(address => Transaction[]) private transactionRecords;
    mapping(address => string) public userIpfsCids;


    function initialize() public initializer() {
        __Ownable_init(msg.sender);

    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner() {}

    // Function to create a wallet for a user
    function createWallet() external {
        require(userWallets[msg.sender] == address(0), "Wallet already exists");

        // Create a new wallet address
        address newWallet = address(new Wallet(msg.sender));
        userWallets[msg.sender] = newWallet;

        emit WalletCreated(msg.sender, newWallet);
    }

    // Deposit funds into the user's wallet
    function deposit() external payable {
        address wallet = userWallets[msg.sender];
        require(wallet != address(0), "Wallet does not exist");

        walletBalances[wallet] += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    // Withdraw funds from the user's wallet
    function withdraw(uint256 amount) external {
        address wallet = userWallets[msg.sender];
        require(wallet != address(0), "Wallet does not exist");
        require(walletBalances[wallet] >= amount, "Insufficient balance");

        walletBalances[wallet] -= amount;
        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }

    // Transfer funds between users
    function transfer(address to, uint256 amount) external {
        address fromWallet = userWallets[msg.sender];

        address toWallet = userWallets[to];

        require(fromWallet != address(0), "Sender wallet does not exist");
        require(toWallet != address(0), "Receiver wallet does not exist");
        require(walletBalances[fromWallet] >= amount, "Insufficient balance");

        walletBalances[fromWallet] -= amount;
        walletBalances[toWallet] += amount;

        // Record the transaction
        transactionRecords[fromWallet].push(Transaction({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        }));
        transactionRecords[toWallet].push(Transaction({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        }));

        emit Transfer(msg.sender, to, amount);
    }

    // // Store IPFS CID
    // function storeIpfsCid(string calldata cid) external {
    //     userIpfsCids[msg.sender] = cid;
    //     emit DataStored(msg.sender, cid);
    // }
    //
    // // Retrieve IPFS CID
    // function getIpfsCid(address user) external view returns (string memory) {
    //     return userIpfsCids[user];
    // }

    // Retrieve transaction records for a wallet
    function getTransactionRecords(address wallet) external view returns (Transaction[] memory) {
        return transactionRecords[wallet];
    }
}
// contract Wallet is Ownable {
//     // Events
//     event Deposit(address indexed sender, uint256 amount);
//     event Withdraw(address indexed recipient, uint256 amount);
//
//     // Constructor sets the initial owner
//     constructor(address initialOwner) Ownable(initialOwner) {}
//
//     // Function to deposit funds into the wallet
//     function deposit() external payable {
//         emit Deposit(msg.sender, msg.value);
//     }
//
//     // Function to withdraw funds from the wallet
//     function withdraw(uint256 _amount) external onlyOwner {
//         require(address(this).balance >= _amount, "Insufficient balance");
//         payable(owner()).transfer(_amount);
//         emit Withdraw(owner(), _amount);
//     }
//
//     // Fallback function to accept Ether sent directly to the contract
//     receive() external payable {}
// }
//
