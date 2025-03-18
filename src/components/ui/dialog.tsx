import type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogTitleProps,
} from '@kobalte/core/dialog';
import { Dialog as KBDialog } from '@kobalte/core/dialog';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import type {
  Component,
  ComponentProps,
  ParentProps,
  ValidComponent,
} from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '@/lib/cn';
import { XIcon } from '@/components/icons';

const DialogRoot: Component<ComponentProps<typeof KBDialog>> = (props) => {
  const [local, rest] = splitProps(props, ['children']);

  return <KBDialog {...rest}>{local.children}</KBDialog>;
};

type dialogContentProps<T extends ValidComponent = 'div'> = ParentProps<
  DialogContentProps<T> & {
    class?: string;
    showCloseButton?: boolean;
  }
>;

const DialogContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, dialogContentProps<T>>,
) => {
  const [local, rest] = splitProps(props as dialogContentProps, [
    'class',
    'children',
    'showCloseButton',
  ]);

  return (
    <KBDialog.Portal>
      <KBDialog.Overlay
        class={cn(
          'fixed inset-0 z-50 bg-[#000000]/65 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0',
        )}
        {...rest}
      />
      <KBDialog.Content
        class={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg data-[closed]:duration-200 data-[expanded]:duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] sm:rounded-lg md:w-full',
          local.class,
        )}
        {...rest}
      >
        {local.children}
        {local.showCloseButton && (
          <KBDialog.CloseButton class='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-[opacity,box-shadow] hover:opacity-100 focus:outline-none focus:ring-[1.5px] focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'>
            <XIcon />

            {/* <svg */}
            {/*   xmlns='http://www.w3.org/2000/svg' */}
            {/*   viewBox='0 0 24 24' */}
            {/*   class='h-4 w-4' */}
            {/* > */}
            {/*   <path */}
            {/*     fill='none' */}
            {/*     stroke='currentColor' */}
            {/*     stroke-linecap='round' */}
            {/*     stroke-linejoin='round' */}
            {/*     stroke-width='2' */}
            {/*     d='M18 6L6 18M6 6l12 12' */}
            {/*   /> */}
            {/*   <title>Close</title> */}
            {/* </svg> */}
          </KBDialog.CloseButton>
        )}
      </KBDialog.Content>
    </KBDialog.Portal>
  );
};

type dialogTitleProps<T extends ValidComponent = 'h2'> = DialogTitleProps<T> & {
  class?: string;
};

const DialogTitle = <T extends ValidComponent = 'h2'>(
  props: PolymorphicProps<T, dialogTitleProps<T>>,
) => {
  const [local, rest] = splitProps(props as dialogTitleProps, ['class']);

  return (
    <KBDialog.Title
      class={cn('text-lg font-semibold text-foreground', local.class)}
      {...rest}
    />
  );
};

type dialogDescriptionProps<T extends ValidComponent = 'p'> =
  DialogDescriptionProps<T> & {
    class?: string;
  };

const DialogDescription = <T extends ValidComponent = 'p'>(
  props: PolymorphicProps<T, dialogDescriptionProps<T>>,
) => {
  const [local, rest] = splitProps(props as dialogDescriptionProps, ['class']);

  return (
    <KBDialog.Description
      class={cn('text-sm text-muted-foreground', local.class)}
      {...rest}
    />
  );
};

const DialogHeader = (props: ComponentProps<'div'>) => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      class={cn(
        'flex flex-col space-y-2 text-center sm:text-left',
        local.class,
      )}
      {...rest}
    />
  );
};

const DialogFooter = (props: ComponentProps<'div'>) => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      class={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        local.class,
      )}
      {...rest}
    />
  );
};

export type { DialogTriggerProps } from '@kobalte/core/dialog';

export const Dialog = Object.assign(DialogRoot, {
  Trigger: KBDialog.Trigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Header: DialogHeader,
  Footer: DialogFooter,
});
