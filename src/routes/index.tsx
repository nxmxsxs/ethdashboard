import { Navigate } from '@solidjs/router';
import { createEffect, createSignal, For } from 'solid-js';
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  formatEther,
} from 'viem';

import DepositFundsForm from '@/components/deposit-funds-form';
import SendFundsForm from '@/components/send-funds-form';
import TransactionCard from '@/components/transaction-card';
import { Button } from '@/components/ui/button';
import type { DialogTriggerProps } from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import { Toast, ToastContent, ToastTitle } from '@/components/ui/toast';
import WithdrawFundsForm from '@/components/withdraw-funds-form';
import { useWallet } from '@/context/wallet';
import { toaster } from '@kobalte/core/toast';

const Home = () => {
  const [state, { fetchUserData, createWallet }] = useWallet();

  createEffect(() => {
    if (!state.connected || !state.walletClient) {
      return <Navigate href='/auth/login' />;
    }
  });

  const [sendFundsOpen, setSendFundsOpen] = createSignal(false);
  const [depositFundsOpen, setDepositFundsOpen] = createSignal(false);
  const [withdrawFundsOpen, setWithdrawFundsOpen] = createSignal(false);

  return (
    <div class='mx-auto mt-10 max-w-5xl overflow-hidden px-4 sm:px-6 lg:px-8'>
      <div class='rounded-lg bg-white p-6 shadow-md'>
        {/* <h2 class='font-sans text-gray-700'>{walletCtx?.walletAddr()}</h2> */}
        <div class='mt-4 flex items-center justify-between'>
          <div>
            <h3 class='text-lg font-medium text-gray-500'>Balance</h3>
            <p class='text-3xl font-bold text-indigo-600'>
              Ξ {`${formatEther(state.balance)} ETH`}
            </p>
          </div>
          {state.isVerified ? (
            <div class='space-x-4'>
              <Dialog open={sendFundsOpen()} onOpenChange={setSendFundsOpen}>
                <Dialog.Trigger
                  as={(props: DialogTriggerProps) => (
                    <Button
                      // variant='default'
                      // size={'lg'}
                      // class='rounded-lg bg-indigo-600 px-6 py-3 text-white shadow hover:bg-indigo-700'
                      class='rounded-lg bg-gray-100 px-6 py-3 text-gray-600 shadow hover:bg-gray-200'
                      {...props}
                    >
                      Send
                    </Button>
                  )}
                />
                <Dialog.Content class='sm:max-w-[500px]'>
                  <Dialog.Header>
                    <Dialog.Title>Send Funds</Dialog.Title>
                    <Dialog.Description>
                      Insert transaction info below
                    </Dialog.Description>
                  </Dialog.Header>

                  <SendFundsForm onConfirm={() => setSendFundsOpen(false)} />
                </Dialog.Content>
              </Dialog>

              <Dialog
                open={depositFundsOpen()}
                onOpenChange={setDepositFundsOpen}
              >
                <Dialog.Trigger
                  as={(props: DialogTriggerProps) => (
                    <Button
                      // variant='default'
                      // size={'lg'}
                      class='rounded-lg bg-gray-100 px-6 py-3 text-gray-600 shadow hover:bg-gray-200'
                      {...props}
                    >
                      Deposit
                    </Button>
                  )}
                />
                <Dialog.Content class='sm:max-w-[425px]'>
                  <Dialog.Header>
                    <Dialog.Title>Deposit Funds</Dialog.Title>
                    <Dialog.Description>
                      Insert transaction info below
                    </Dialog.Description>
                  </Dialog.Header>

                  <DepositFundsForm
                    onConfirm={() => setDepositFundsOpen(false)}
                  />
                </Dialog.Content>
              </Dialog>
              <Dialog
                open={withdrawFundsOpen()}
                onOpenChange={setWithdrawFundsOpen}
              >
                <Dialog.Trigger
                  as={(props: DialogTriggerProps) => (
                    <Button
                      // variant='default'
                      // size={'lg'}
                      class='rounded-lg bg-gray-100 px-6 py-3 text-gray-600 shadow hover:bg-gray-200'
                      {...props}
                    >
                      Withdraw
                    </Button>
                  )}
                />
                <Dialog.Content class='sm:max-w-[425px]'>
                  <Dialog.Header>
                    <Dialog.Title>Withdraw Funds</Dialog.Title>
                    <Dialog.Description>
                      Insert transaction info below
                    </Dialog.Description>
                  </Dialog.Header>

                  <WithdrawFundsForm
                    onConfirm={() => setWithdrawFundsOpen(false)}
                  />
                </Dialog.Content>
              </Dialog>
            </div>
          ) : (
            <div>
              <Button
                onClick={async () => {
                  await createWallet({
                    onWalletCreated: (logs) => {
                      const l = logs[0];
                      fetchUserData();

                      toaster.show((props) => {
                        return (
                          <Toast toastId={props.toastId}>
                            <ToastContent>
                              <ToastTitle>Transaction Info</ToastTitle>
                              <div>Wallet Created Successfully</div>
                            </ToastContent>
                          </Toast>
                        );
                      });
                    },
                    onError: (err) => {
                      const revertError = err.walk(
                        (err) => err instanceof ContractFunctionRevertedError,
                      ) as ContractFunctionRevertedError | null;

                      const execError = err.walk(
                        (err) => err instanceof ContractFunctionExecutionError,
                      ) as ContractFunctionExecutionError | null;

                      toaster.show((props) => (
                        <Toast toastId={props.toastId}>
                          <ToastContent>
                            <ToastTitle>Transaction Failed</ToastTitle>
                            <div>{revertError?.reason}</div>
                            <div>{execError?.details}</div>
                          </ToastContent>
                        </Toast>
                      ));
                    },
                  });
                }}
              >
                Create Wallet
              </Button>
            </div>
          )}
        </div>
      </div>

      {/*<!-- Recent Transactions -->*/}
      <div class='mt-8'>
        <h2 class='text-xl font-semibold text-ctp-surface2'>
          Recent Transactions
        </h2>
      </div>
      <For each={state.transactions.slice(-10).reverse()}>
        {(t) => <TransactionCard transaction={t} />}
      </For>
    </div>
  );
};

export default Home;
