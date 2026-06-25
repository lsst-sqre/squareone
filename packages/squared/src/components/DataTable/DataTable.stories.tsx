import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../Badge';
import { DataTable } from './DataTable';

type NotificationRow = {
  recipient: string;
  sender: string;
  created: string;
  summary: string;
};

const columns: ColumnDef<NotificationRow>[] = [
  { accessorKey: 'recipient', header: 'Recipient' },
  { accessorKey: 'sender', header: 'Sender' },
  { accessorKey: 'created', header: 'Created' },
  { accessorKey: 'summary', header: 'Summary', enableSorting: false },
];

// Server order is most-recent-first (created-desc); recipients are
// intentionally not alphabetical so an ascending sort visibly reorders.
const rows: NotificationRow[] = [
  {
    recipient: 'zoya',
    sender: 'times-square',
    created: '2026-06-17 10:00 UTC',
    summary: 'Your notebook finished executing.',
  },
  {
    recipient: 'amir',
    sender: 'mobu',
    created: '2026-06-16 09:30 UTC',
    summary: 'A monitored flock reported an error.',
  },
  {
    recipient: 'mina',
    sender: 'nublado',
    created: '2026-06-15 08:15 UTC',
    summary: 'Your CPU quota was increased.',
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A generic, TanStack-Table-backed table. **Sorting caveat:** rows ' +
          'arrive in the server order (for example created-desc, as in the ' +
          'admin notifications UI). ' +
          'Clicking a sortable header sorts only the currently-loaded rows on ' +
          'the client — it does not re-query the server, so it is not a global ' +
          'sort across unloaded pages. "Load more" is a caller-owned slot: the ' +
          'consumer fetches the next cursor page and appends it to `data`.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DataTable columns={columns} data={rows} />,
};

// Cells can render arbitrary React via a column `cell` renderer.
export const WithRenderedCells: Story = {
  name: 'With rendered cells',
  render: () => {
    const richColumns: ColumnDef<NotificationRow>[] = [
      { accessorKey: 'recipient', header: 'Recipient' },
      {
        accessorKey: 'sender',
        header: 'Sender',
        cell: (info) => <Badge color="blue">{info.getValue<string>()}</Badge>,
      },
      { accessorKey: 'created', header: 'Created' },
      { accessorKey: 'summary', header: 'Summary', enableSorting: false },
    ];
    return <DataTable columns={richColumns} data={rows} />;
  },
};

// `renderDetailRow` renders a full-width secondary row beneath each primary
// row. The sortable columns get the full table width while the wide content
// (here a summary) spans every column below — a two-row layout per item.
export const WithDetailRow: Story = {
  name: 'With detail row',
  render: () => {
    const primaryColumns: ColumnDef<NotificationRow>[] = [
      { accessorKey: 'recipient', header: 'Recipient' },
      { accessorKey: 'sender', header: 'Sender' },
      { accessorKey: 'created', header: 'Created' },
    ];
    return (
      <DataTable
        columns={primaryColumns}
        data={rows}
        renderDetailRow={(row) => row.summary}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The summary content appears full-width beneath its primary row.
    await expect(
      canvas.getByText('Your notebook finished executing.')
    ).toBeInTheDocument();

    // There is no "Summary" column header; the detail row carries it instead.
    await expect(
      canvas.queryByRole('columnheader', { name: /Summary/ })
    ).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyContent="No notifications match your filters."
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('No notifications match your filters.')
    ).toBeInTheDocument();
  },
};

// Loading is owned by the caller; the table only reflects it on the button.
export const LoadingMore: Story = {
  name: 'Loading more',
  render: () => (
    <DataTable
      columns={columns}
      data={rows}
      hasMore
      isLoadingMore
      onLoadMore={() => {}}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: /load more/i })
    ).toBeDisabled();
  },
};

// Interaction test: clicking a sortable header sorts the loaded rows.
export const Sortable: Story = {
  render: () => <DataTable columns={columns} data={rows} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Server order: the first body row is for recipient "zoya".
    const initialBodyRows = canvas.getAllByRole('row').slice(1);
    await expect(
      within(initialBodyRows[0]).getByText('zoya')
    ).toBeInTheDocument();

    // Click the Recipient header to sort ascending.
    await userEvent.click(canvas.getByRole('button', { name: /Recipient/ }));

    await waitFor(async () => {
      const sortedBodyRows = canvas.getAllByRole('row').slice(1);
      await expect(
        within(sortedBodyRows[0]).getByText('amir')
      ).toBeInTheDocument();
    });

    // The header reports its sort state to assistive tech.
    const recipientHeader = canvas.getByRole('columnheader', {
      name: /Recipient/,
    });
    await expect(recipientHeader).toHaveAttribute('aria-sort', 'ascending');
  },
};

// A stateful host that owns cursor loading; the table only exposes the slot.
function LoadMoreDemo() {
  const allRows: NotificationRow[] = Array.from({ length: 12 }, (_, i) => ({
    recipient: `user-${String(i).padStart(2, '0')}`,
    sender: 'mobu',
    created: `2026-06-${String(17 - i).padStart(2, '0')} 12:00 UTC`,
    summary: `Notification number ${i}`,
  }));
  const pageSize = 5;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const data = allRows.slice(0, visibleCount);

  return (
    <DataTable
      columns={columns}
      data={data}
      hasMore={visibleCount < allRows.length}
      onLoadMore={() =>
        setVisibleCount((count) => Math.min(count + pageSize, allRows.length))
      }
    />
  );
}

// A stateful host owning controlled row-selection state, mirroring how the
// notifications inbox wires selection for its bulk "Mark read" action.
function SelectableDemo() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div>
      <p style={{ marginBottom: 'var(--sqo-space-sm)' }}>
        {selectedCount} selected
      </p>
      <DataTable
        columns={columns}
        data={rows}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  );
}

// Interaction test: the leading checkbox column selects individual rows and
// the header checkbox selects/clears all loaded rows.
export const Selectable: Story = {
  render: () => <SelectableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // No rows selected to start.
    await expect(canvas.getByText('0 selected')).toBeInTheDocument();

    // Toggling a single row updates the controlled selection.
    const rowCheckboxes = canvas.getAllByRole('checkbox', {
      name: /select row/i,
    });
    await userEvent.click(rowCheckboxes[0]);
    await waitFor(async () => {
      await expect(canvas.getByText('1 selected')).toBeInTheDocument();
    });
    await expect(rowCheckboxes[0]).toBeChecked();

    // Select-all toggles every loaded row.
    await userEvent.click(
      canvas.getByRole('checkbox', { name: /select all/i })
    );
    await waitFor(async () => {
      await expect(
        canvas.getByText(`${rows.length} selected`)
      ).toBeInTheDocument();
    });
    for (const checkbox of canvas.getAllByRole('checkbox', {
      name: /select row/i,
    })) {
      await expect(checkbox).toBeChecked();
    }

    // Toggling select-all again clears the selection.
    await userEvent.click(
      canvas.getByRole('checkbox', { name: /select all/i })
    );
    await waitFor(async () => {
      await expect(canvas.getByText('0 selected')).toBeInTheDocument();
    });
  },
};

// Interaction test: the "Load more" slot invokes the caller's handler,
// which appends the next page of rows.
export const LoadMore: Story = {
  name: 'Load more',
  render: () => <LoadMoreDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 5 body rows + 1 header row to start.
    await expect(canvas.getAllByRole('row')).toHaveLength(6);

    await userEvent.click(canvas.getByRole('button', { name: /load more/i }));

    await waitFor(() => {
      // 10 body rows + 1 header row after one page.
      expect(canvas.getAllByRole('row')).toHaveLength(11);
    });
  },
};
