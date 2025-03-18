import { Component } from 'solid-js';
import { type UserWalletMgrTransaction } from '@/lib/eth/user-wallet-mgr-contract';
import { formatEther } from 'viem';
import { useWallet } from '@/context/wallet';

type TransactionProps = {
  transaction: UserWalletMgrTransaction;
};

const TransactionCard: Component<TransactionProps> = ({ transaction }) => {
  const [state, _] = useWallet();

  const amount = formatEther(transaction.amount);

  return (
    <div class='my-4 divide-y divide-gray-200 border-2 border-ctp-overlay0 bg-[#181A1B] shadow-2xl'>
      {/*<!-- Transaction Item -->*/}
      <div class='flex items-center justify-between p-4'>
        <div>
          {state.walletClient?.account.address == transaction.from ? (
            <p>
              <span class='text-gray-500'>Sent to: </span>
              <span class='text-ctp-sky'>{transaction.to}</span>
            </p>
          ) : (
            <p>
              <span class='text-gray-500'>Received from: </span>
              <span class='text-ctp-sky'>{transaction.from}</span>
            </p>
          )}

          <p class='text-sm italic text-gray-400'>
            {new Date(Number(transaction.timestamp) * 1000).toLocaleString()}
          </p>
        </div>

        {state.walletClient?.account.address == transaction.from ? (
          <p class='font-bold text-red-500'>Ξ -{amount} ETH</p>
        ) : (
          <p class='font-bold text-green-400'>Ξ +{amount} ETH</p>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
