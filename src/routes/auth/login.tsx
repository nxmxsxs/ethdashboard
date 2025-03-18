import { useNavigate } from '@solidjs/router';
import { createEffect } from 'solid-js';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/wallet';

const Login = () => {
  const [state, { connectMetamask }] = useWallet();
  const navigate = useNavigate();

  createEffect(() => {
    if (state.walletClient) {
      navigate('/');
    }
  });

  return (
    <div class='flex items-center justify-center'>
      <div class='fixed left-[50%] top-[50%] z-50 grid h-[200px] w-[200px] max-w-lg translate-x-[-50%] translate-y-[-50%] items-center justify-center gap-4 border bg-gray-200 p-6 shadow-lg sm:rounded-lg md:w-full'>
        <Button onClick={connectMetamask}>Connect Metamask</Button>
      </div>
    </div>
  );
};

export default Login;
