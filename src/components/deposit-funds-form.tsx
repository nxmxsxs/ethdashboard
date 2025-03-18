import { toaster } from '@kobalte/core/toast';
import { createForm } from '@tanstack/solid-form';
import { Component } from 'solid-js';
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  formatEther,
} from 'viem';

import { useWallet } from '@/context/wallet';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
} from './ui/textfield';
import { Toast, ToastContent, ToastTitle } from './ui/toast';

type DepositFundsFormProps = {
  onConfirm?: () => void;
};
const DepositFundsForm: Component<DepositFundsFormProps> = ({ onConfirm }) => {
  const [state, { depositFunds, fetchUserData }] = useWallet();

  const depositFundsForm = createForm<{ amount: string }>(() => ({
    onSubmit: async ({ value }) => {
      const amount = BigInt(value.amount);

      console.log(amount);

      const hash = await depositFunds([amount], {
        onDeposit: (logs) => {
          const l = logs[0];

          fetchUserData();

          toaster.show((props) => {
            return (
              <Toast toastId={props.toastId}>
                <ToastContent>
                  <ToastTitle>Transaction Info</ToastTitle>
                  <div>
                    Successful deposited {formatEther(BigInt(l.args.amount!))}{' '}
                    ETH
                  </div>
                </ToastContent>
              </Toast>
            );
          });
        },
        onError: (err) => {
          const revertError = err.walk(
            (err) => err instanceof ContractFunctionRevertedError,
          ) as ContractFunctionRevertedError;

          const execError = err.walk(
            (err) => err instanceof ContractFunctionExecutionError,
          ) as ContractFunctionExecutionError;

          toaster.show((props) => {
            return (
              <Toast toastId={props.toastId}>
                <ToastContent>
                  <ToastTitle>Transaction Failed</ToastTitle>
                  <div>{revertError?.reason}</div>
                  <div>{execError?.details}</div>
                </ToastContent>
              </Toast>
            );
          });
        },
      });

      if (onConfirm) {
        onConfirm();
      }
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        depositFundsForm.handleSubmit();
      }}
    >
      <div class='grid gap-4 py-4'>
        <depositFundsForm.Field
          name='amount'
          validators={{
            onSubmit: ({ value }) => {
              if (isNaN(parseInt(value))) {
                return 'Value is not a number';
              }

              return undefined;
            },
          }}
          children={(field) => (
            <TextField
              class='grid grid-cols-3 items-center gap-4 md:grid-cols-4'
              name={field().name}
              value={field().state.value}
              onBlur={field().handleBlur}
              onChange={field().handleChange}
              validationState={
                field().state.meta.errors.length == 0 ? 'valid' : 'invalid'
              }
            >
              <TextFieldLabel class='text-left'>Amount</TextFieldLabel>
              <TextFieldInput class='col-span-2 md:col-span-3' />
              <TextFieldErrorMessage class='col-span-2 col-start-2 md:col-span-3 md:col-start-2'>
                {field().state.meta.errors.join(', ')}
              </TextFieldErrorMessage>
            </TextField>
          )}
        />
      </div>

      <depositFundsForm.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={(state) => {
          return (
            <Dialog.Footer>
              <Button type='submit' disabled={!state().canSubmit}>
                {state().isSubmitting ? '...' : 'Transact'}
              </Button>
            </Dialog.Footer>
          );
        }}
      />
    </form>
  );
};

export default DepositFundsForm;
