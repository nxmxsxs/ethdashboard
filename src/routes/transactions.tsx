import { debounce } from '@solid-primitives/scheduled';
import {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
} from '@tanstack/solid-table';
import { createEffect, createSignal, For } from 'solid-js';
import { formatEther } from 'viem';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField, TextFieldInput } from '@/components/ui/textfield';
import { useWallet } from '@/context/wallet';
import { UserWalletMgrTransaction } from '@/lib/eth/user-wallet-mgr-contract';
import { Navigate } from '@solidjs/router';

function addrEllipsis(str: string) {
  return str.slice(0, 6) + '...' + str.slice(-4);
}

const Transactions = () => {
  const [state, {}] = useWallet();

  createEffect(() => {
    if (!state.connected || !state.walletClient) {
      return <Navigate href='/auth/login'></Navigate>;
    }
  });

  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const columns: ColumnDef<UserWalletMgrTransaction>[] = [
    {
      id: 'From',
      accessorFn: (t) => t.from,
      header: () => <span>From</span>,
      cell: (c) => <span>{addrEllipsis(c.getValue() as string)}</span>,
    },
    {
      id: 'To',
      accessorFn: (t) => t.to,
      header: () => <span>To</span>,
      cell: (c) => <span>{addrEllipsis(c.getValue() as string)}</span>,
    },
    {
      id: 'Amount',
      accessorFn: (t) => `${formatEther(t.amount)} ETH`,
      header: () => <span>Amount</span>,
      cell: (c) => <span>{c.getValue() as string}</span>,
    },
    {
      id: 'Timestamp',
      accessorFn: (t) => new Date(Number(t.timestamp) * 1000),
      header: () => <span>Timestamp</span>,
      cell: (c) => <span>{(c.getValue() as Date).toLocaleString()}</span>,
    },
  ];

  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([
    {
      id: 'From',
      value: '',
    },
  ]);

  const [sorting, setSorting] = createSignal<SortingState>([]);

  const tbl = createSolidTable({
    get data() {
      return state.transactions;
    },
    columns,
    state: {
      get pagination() {
        return pagination();
      },
      get columnFilters() {
        return columnFilters();
      },
      get sorting() {
        return sorting();
      },
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
  });

  return (
    <div class='m-8 overflow-hidden'>
      <div class='flex flex-row items-center justify-between py-2'>
        <div class='flex flex-row'>
          <Select
            class='mr-1'
            options={tbl.getHeaderGroups()[0].headers.map((h) => h.id)}
            defaultValue={columnFilters()[0].id}
            itemComponent={(props) => (
              <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
            )}
          >
            <SelectTrigger>
              <span class='mr-2 text-xs italic text-ctp-text'>filter by: </span>
              <SelectValue<string>>
                {(state) => {
                  const id = state.selectedOption();

                  setColumnFilters((f) => [
                    {
                      ...f[0],
                      id,
                    },
                  ]);

                  return <span class='text-ctp-text'>{id}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
          <TextField
            class='items-center gap-4 text-ctp-text'
            onChange={debounce((value) => {
              setColumnFilters((f) => [
                {
                  ...f[0],
                  value,
                },
              ]);
            }, 250)}
          >
            <TextFieldInput />
          </TextField>
        </div>

        <div>
          <Button
            variant={'secondary'}
            class='mr-1 h-6 w-6 p-0 text-xs hover:bg-slate-200'
            disabled={pagination().pageIndex <= 0}
            onClick={() => {
              tbl.previousPage();
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant={'secondary'}
            class='h-6 w-6 p-0 text-xs hover:bg-slate-200'
            disabled={pagination().pageIndex >= tbl.getPageCount() - 1}
            onClick={() => {
              tbl.nextPage();
            }}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <table class='w-full border border-ctp-overlay0'>
        <thead>
          <For each={tbl.getHeaderGroups()}>
            {(hg) => (
              <tr>
                <For each={hg.headers}>
                  {(h) => (
                    <th class='relative min-w-[100px] hover:bg-ctp-overlay0'>
                      {flexRender(
                        <div
                          class={
                            h.column.getCanSort()
                              ? 'cursor-pointer select-none text-ctp-text'
                              : undefined
                          }
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          <span>{h.column.id}</span>
                          <div class='absolute right-0 top-0'>
                            {{
                              asc: <ChevronUpIcon />,
                              desc: <ChevronDownIcon />,
                            }[h.column.getIsSorted() as string] ?? null}
                          </div>
                        </div>,
                        h.getContext(),
                      )}
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={tbl.getPaginationRowModel().rows}>
            {(row) => (
              <tr>
                <For each={row.getVisibleCells()}>
                  {(c) => (
                    <td class='border border-ctp-overlay0 px-4 text-ctp-text'>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
