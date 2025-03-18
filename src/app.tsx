/* @refresh reload */
import { lazy, Suspense } from 'solid-js';
import { render } from 'solid-js/web';
import { MetaProvider, Title } from '@solidjs/meta';
import { Router, Route } from '@solidjs/router';

import { WalletProvider } from './context/wallet.ts';
import NavBar from './components/navbar.tsx';
import { ToastList, ToastRegion } from './components/ui/toast.tsx';

import './app.css';

const Index = lazy(() => import('./routes/index.tsx'));
const AuthLogin = lazy(() => import('./routes/auth/login.tsx'));
const DepositFunds = lazy(() => import('./routes/deposit-funds.tsx'));
const SendFunds = lazy(() => import('./routes/send-funds.tsx'));
const Transactions = lazy(() => import('./routes/transactions.tsx'));

render(
  () => (
    <Router
      root={(props) => (
        <WalletProvider>
          <MetaProvider>
            <Title>User Wallet Manager</Title>
            <div class='flex min-h-screen flex-col overflow-hidden bg-[#181A1B]'>
              <NavBar />
              <div class=''>
                <Suspense>{props.children}</Suspense>
              </div>
            </div>
            <ToastRegion>
              <ToastList />
            </ToastRegion>
          </MetaProvider>
        </WalletProvider>
      )}
    >
      <Route path='/' component={Index} />
      <Route path='/auth/login' component={AuthLogin} />
      <Route path='/deposit-funds' component={DepositFunds} />
      <Route path='/send-funds' component={SendFunds} />
      <Route path='/transactions' component={Transactions} />
    </Router>
  ),
  document.getElementById('root')!,
);
