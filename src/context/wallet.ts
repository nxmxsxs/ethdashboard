import { createContextProvider } from '@solid-primitives/context';
import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  Account,
  Address,
  BaseError,
  Chain,
  createTestClient,
  createWalletClient,
  custom,
  http,
  publicActions,
  Transport,
  WalletClient,
  WatchContractEventOnLogsParameter,
  getAddress,
} from 'viem';
import { anvil } from 'viem/chains';

import {
  type UserWalletMgrTransaction,
  abi,
} from '@/lib/eth/user-wallet-mgr-contract';

const [WalletProvider, useWalletContext] = createContextProvider(
  (props: {}) => {
    const publicClient = createTestClient({
      mode: 'anvil',
      chain: anvil,
      transport: http(),
    }).extend(publicActions);

    const [state, setState] = createStore<{
      balance: bigint;
      transactions: UserWalletMgrTransaction[];
      publicClient: typeof publicClient;
      walletClient?: WalletClient<Transport, Chain, Account>;
      // contract?: GetContractReturnType<typeof abi, Client, Address>;
      isVerified: boolean;
      connected: boolean;
    }>({
      balance: 0n,
      transactions: [],
      walletClient: undefined,
      publicClient,
      // contract: undefined,
      isVerified: false,
      connected: false,
    });

    const fetchUserData = async () => {
      const [balance, innerUserWallet, transactions] = await Promise.all([
        publicClient.readContract({
          address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
          abi,
          functionName: 'getWalletBalance',
          args: [],
          account: state.walletClient?.account,
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
          abi,
          functionName: 'getUserWallet',
          args: [],
          account: state.walletClient?.account,
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
          abi,
          functionName: 'getTransactionRecords',
          args: [],
          account: state.walletClient?.account,
        }) as Promise<UserWalletMgrTransaction[]>,
      ]);

      setState({
        balance,
        isVerified:
          innerUserWallet !== '0x0000000000000000000000000000000000000000',
        transactions,
      });
    };

    onMount(async () => {
      const getAccounts = async () => {
        return window.ethereum!.request({
          method: 'eth_accounts',
        });
      };

      const accounts = await getAccounts();
      if (accounts.length > 0) {
        const walletClient =
          accounts[0] &&
          createWalletClient({
            account: getAddress(accounts[0]),
            // chain: holesky,
            chain: anvil,
            transport: custom(window.ethereum!),
          });

        setState({
          walletClient,
          connected: true,
        });

        fetchUserData();
      }

      window.ethereum!.on('connect', async (_) => {
        console.log('connected');
      });

      window.ethereum!.on('accountsChanged', async (accounts) => {
        console.log('accountsChanged to ', accounts[0]);

        if (accounts[0]) {
          const walletClient = createWalletClient({
            account: getAddress(accounts[0]),
            // chain: holesky,
            chain: anvil,
            transport: custom(window.ethereum!),
          });

          setState({
            walletClient,
          });

          fetchUserData();
        } else {
          setState({
            walletClient: undefined,
          });
        }
      });

      window.ethereum!.on('disconnect', async (_) => {
        console.log('disconnected');
      });

      setState({
        connected: true,
      });
    });

    return [
      state,
      {
        connectMetamask: async () => {
          const accounts = await window.ethereum!.request({
            method: 'eth_requestAccounts',
          });

          if (accounts[0]) {
            const walletClient = createWalletClient({
              account: getAddress(accounts[0]),
              // chain: holesky,
              chain: anvil,
              transport: custom(window.ethereum!),
            });

            setState({
              walletClient,
              connected: true,
            });
          }
        },
        createWallet: async (cbs: {
          onWalletCreated?: (
            logs: WatchContractEventOnLogsParameter<
              typeof abi,
              'WalletCreated'
            >,
          ) => void;
          onError?: (err: BaseError) => void;
        }) => {
          const unwatch = publicClient.watchContractEvent({
            address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
            abi,
            eventName: 'WalletCreated',
            onLogs: (logs) => {
              unwatch();

              if (cbs.onWalletCreated) {
                cbs.onWalletCreated(logs);
              }
            },
          });

          try {
            const simRes = await publicClient.simulateContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'createWallet',
              account: state.walletClient?.account,
              args: [],
            });

            const txHash = await state.walletClient?.writeContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'createWallet',
              args: [],
            });

            return txHash;
          } catch (err) {
            unwatch();

            if (err instanceof BaseError && cbs.onError) {
              cbs.onError(err);
            }
          }
        },
        transferFunds: async (
          [dest, amount]: [Address, bigint],
          cbs: {
            onTransfer?: (
              logs: WatchContractEventOnLogsParameter<typeof abi, 'Transfer'>,
            ) => void;
            onError?: (err: BaseError) => void;
          },
        ) => {
          const unwatch = publicClient.watchContractEvent({
            address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
            abi,
            eventName: 'Transfer',
            onLogs: (logs) => {
              unwatch();

              if (cbs.onTransfer) {
                cbs.onTransfer(logs);
              }
            },
          });

          try {
            const simRes = await publicClient.simulateContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'transfer',
              args: [dest, amount],
              account: state.walletClient?.account,
            });

            const txHash = await state.walletClient?.writeContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'transfer',
              args: [dest, amount],
            });

            return txHash;
          } catch (err) {
            unwatch();

            if (err instanceof BaseError && cbs.onError) {
              cbs.onError(err);
            }
          }
        },

        depositFunds: async (
          [amount]: [bigint],
          cbs: {
            onDeposit?: (
              logs: WatchContractEventOnLogsParameter<typeof abi, 'Deposit'>,
            ) => void;
            onError?: (err: BaseError) => void;
          },
        ) => {
          const unwatch = publicClient.watchContractEvent({
            address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
            abi,
            eventName: 'Deposit',
            onLogs: (logs) => {
              unwatch();

              if (cbs.onDeposit) {
                cbs.onDeposit(logs);
              }
            },
          });

          try {
            const simRes = await publicClient.simulateContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'deposit',
              account: state.walletClient?.account,
              value: amount,
            });

            const txHash = await state.walletClient?.writeContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'deposit',
              value: amount,
            });

            return txHash;
          } catch (err) {
            unwatch();

            if (err instanceof BaseError && cbs.onError) {
              cbs.onError(err);
            }
          }
        },

        withdrawFunds: async (
          [amount]: [bigint],
          cbs: {
            onWithdrawal?: (
              logs: WatchContractEventOnLogsParameter<typeof abi, 'Withdrawal'>,
            ) => void;
            onError?: (err: BaseError) => void;
          },
        ) => {
          const unwatch = publicClient.watchContractEvent({
            address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
            abi,
            eventName: 'Withdrawal',
            onLogs: (logs) => {
              unwatch();

              if (cbs.onWithdrawal) {
                cbs.onWithdrawal(logs);
              }
            },
          });

          try {
            const simRes = await publicClient.simulateContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'withdraw',
              account: state.walletClient?.account,
              args: [amount],
            });

            const txHash = await state.walletClient?.writeContract({
              address: import.meta.env.VITE_ANVIL_USER_WALLET_MGR_PROXY,
              abi,
              functionName: 'withdraw',
              args: [amount],
            });

            return txHash;
          } catch (err) {
            unwatch();

            if (err instanceof BaseError && cbs.onError) {
              cbs.onError(err);
            }
          }
        },

        fetchUserData,
      },
    ] as const;
  },
);

export { WalletProvider };
export const useWallet = () => {
  const ctx = useWalletContext();
  if (ctx === undefined) {
    throw new Error(
      '[wallet]: `useWallet` must be used within a `WalletProvider` component',
    );
  }

  return ctx;
};
