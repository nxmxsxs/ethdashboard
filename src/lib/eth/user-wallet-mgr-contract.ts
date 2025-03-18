import {
  GetContractReturnType,
  Client,
  Transport,
  Chain,
  Account,
  ReadContractReturnType,
} from 'viem';
import { userWalletMgrV4Abi } from './abi';

export const abi = userWalletMgrV4Abi;

type UserWalletMgrAbi = typeof abi;

export type UserWalletMgrContract = GetContractReturnType<
  UserWalletMgrAbi,
  Client<Transport, Chain, Account>
>;

export type UserWalletMgrTransaction = ReadContractReturnType<
  UserWalletMgrAbi,
  'getTransactionRecords'
>[0];
