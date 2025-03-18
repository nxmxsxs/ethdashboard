import { createForm } from '@tanstack/solid-form';
import { Component } from 'solid-js';
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  formatEther,
  getAddress,
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
import { toaster } from '@kobalte/core/toast';
import { Toast, ToastContent, ToastTitle } from './ui/toast';

type SendFundsFormProps = {
  onConfirm?: () => void;
};

const SendFundsForm: Component<SendFundsFormProps> = ({ onConfirm }) => {
  const [state, { transferFunds, fetchUserData }] = useWallet();

  const sendFundsForm = createForm<{ amount: string; dest: string }>(() => ({
    onSubmit: async ({ value }) => {
      const amount = BigInt(value.amount);
      const dest = getAddress(value.dest);

      console.log(amount, dest);

      const hash = await transferFunds([dest, amount], {
        onTransfer: (logs) => {
          const l = logs[0];
          fetchUserData();
          console.log('transfer logs', l);

          toaster.show((props) => {
            return (
              <Toast toastId={props.toastId}>
                <ToastContent>
                  <ToastTitle>Transaction Info</ToastTitle>
                  <div>
                    Successful transferred {formatEther(amount)} ETH to{' '}
                    {l.args.to}
                  </div>
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
        sendFundsForm.handleSubmit();
      }}
    >
      <div class='grid gap-4 py-4'>
        <sendFundsForm.Field
          name='dest'
          validators={{
            onSubmit: ({ value }) => {
              if (!value.startsWith('0x')) {
                return 'Invalid Address Format';
              }

              if (value.length != 42) {
                return 'Invalid Address Length';
              }

              return undefined;
            },
          }}
          children={(field) => {
            return (
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
                <TextFieldLabel class='text-left'>
                  Destination Address
                </TextFieldLabel>
                <TextFieldInput class='col-span-2 md:col-span-3' />
                <TextFieldErrorMessage class='col-span-2 col-start-2 md:col-span-3 md:col-start-2'>
                  {field().state.meta.errors.join(', ')}
                </TextFieldErrorMessage>
              </TextField>
            );
          }}
        />

        <sendFundsForm.Field
          name='amount'
          validators={{
            onSubmit: ({ value }) => {
              if (isNaN(parseInt(value))) {
                return 'Value is not a number';
              }

              return undefined;
            },
          }}
          children={(field) => {
            return (
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
            );
          }}
        />

        <sendFundsForm.Subscribe
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
      </div>
    </form>
  );
};

export default SendFundsForm;
