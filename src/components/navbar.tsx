import { useWallet } from '@/context/wallet';
import { A } from '@solidjs/router';
import { Show } from 'solid-js';

const NavBar = () => {
  const [state, _] = useWallet();

  return (
    <Show when={state.connected && state.walletClient}>
      <div class='mt-8 flex flex-row justify-center'>
        <A
          href='/'
          class='mr-8 rounded-2xl border-2 border-ctp-subtext1 px-2 py-2 align-middle text-ctp-text hover:bg-ctp-overlay0'
        >
          Dashboard
        </A>
        <A
          href='/transactions'
          class='rounded-2xl border-2 border-ctp-subtext0 px-2 py-2 align-middle text-ctp-text hover:bg-ctp-overlay0'
        >
          Transactions
        </A>
      </div>
    </Show>
  );
};

export default NavBar;
