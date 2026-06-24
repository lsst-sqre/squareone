import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './DataTable';

type Row = { name: string; count: number };

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'count', header: 'Count' },
];

// Intentionally not pre-sorted by name, so a single ascending sort click
// visibly reorders the rows. This mirrors the server's created-desc order
// being independent of any client-side column sort.
const data: Row[] = [
  { name: 'Bravo', count: 1 },
  { name: 'Alpha', count: 3 },
];

describe('DataTable', () => {
  it('renders a table element', () => {
    const { container } = render(<DataTable columns={columns} data={data} />);

    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('applies aria-label to the table when no caption is provided', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        aria-label="Recent notifications"
      />
    );

    expect(container.querySelector('table')?.getAttribute('aria-label')).toBe(
      'Recent notifications'
    );
  });

  it('renders a visible caption', () => {
    render(
      <DataTable columns={columns} data={data} caption="Recent notifications" />
    );

    expect(screen.getByText('Recent notifications').tagName).toBe('CAPTION');
  });

  it('drops aria-label when a caption is present', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        caption="Recent notifications"
        aria-label="Recent notifications"
      />
    );

    expect(container.querySelector('table')?.hasAttribute('aria-label')).toBe(
      false
    );
  });

  it('renders a column header for each column def', () => {
    render(<DataTable columns={columns} data={data} />);

    expect(
      screen.getByRole('columnheader', { name: /Name/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Count/ })
    ).toBeInTheDocument();
  });

  it('renders a body row for each data item with its cell values', () => {
    render(<DataTable columns={columns} data={data} />);

    // One header row + two data rows.
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  it('shows the empty content when there are no rows', () => {
    render(
      <DataTable columns={columns} data={[]} emptyContent="No notifications" />
    );

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('does not render the Load more footer without onLoadMore', () => {
    render(<DataTable columns={columns} data={data} />);

    expect(
      screen.queryByRole('button', { name: /load more/i })
    ).not.toBeInTheDocument();
  });

  it('renders a Load more button and invokes the caller handler on click', async () => {
    const onLoadMore = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        hasMore
        onLoadMore={onLoadMore}
      />
    );

    const button = screen.getByRole('button', { name: /load more/i });
    await userEvent.click(button);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('hides the Load more button when there is nothing more to load', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        hasMore={false}
        onLoadMore={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: /load more/i })
    ).not.toBeInTheDocument();
  });

  it('disables the Load more button while a load is in flight', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        hasMore
        isLoadingMore
        onLoadMore={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /load more/i })).toBeDisabled();
  });

  it('sorts loaded rows client-side when a sortable header is clicked', async () => {
    render(<DataTable columns={columns} data={data} />);

    // Default order follows the data prop (server order): Bravo, then Alpha.
    const initialCells = screen
      .getAllByRole('cell')
      .filter((cell) => /Alpha|Bravo/.test(cell.textContent ?? ''));
    expect(initialCells[0]).toHaveTextContent('Bravo');

    // Sorting by Name ascending reorders the loaded rows: Alpha before Bravo.
    await userEvent.click(screen.getByRole('button', { name: /Name/ }));

    const sortedCells = screen
      .getAllByRole('cell')
      .filter((cell) => /Alpha|Bravo/.test(cell.textContent ?? ''));
    expect(sortedCells[0]).toHaveTextContent('Alpha');
  });

  it('renders a detail row per data item with a full-width cell when renderDetailRow is provided', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        renderDetailRow={(row) => <span>detail: {row.name}</span>}
      />
    );

    // One detail row per data item, each holding a single cell that spans
    // every column.
    const detailCells = Array.from(
      container.querySelectorAll('td[colspan]')
    ).filter((cell) => cell.getAttribute('colspan') === String(columns.length));
    expect(detailCells).toHaveLength(data.length);

    // The detail content is rendered for each item.
    expect(screen.getByText('detail: Alpha')).toBeInTheDocument();
    expect(screen.getByText('detail: Bravo')).toBeInTheDocument();
  });

  it('still renders the primary cell values alongside detail rows', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        renderDetailRow={(row) => <span>detail: {row.name}</span>}
      />
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  it('applies a custom className to the table wrapper', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

// A controlled host owning row-selection state, mirroring how a consumer
// (the notifications inbox) wires the selection props.
function SelectableTable({
  onChange,
}: {
  onChange?: (selection: RowSelectionState) => void;
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  return (
    <DataTable
      columns={columns}
      data={data}
      rowSelection={rowSelection}
      onRowSelectionChange={(updater) => {
        setRowSelection((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          onChange?.(next);
          return next;
        });
      }}
    />
  );
}

describe('DataTable row selection', () => {
  it('renders no checkbox column when the selection props are omitted', () => {
    render(<DataTable columns={columns} data={data} />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders a leading checkbox column with a select-all header checkbox when selection is enabled', () => {
    render(<SelectableTable />);

    // One select-all header checkbox plus one checkbox per loaded row.
    expect(screen.getAllByRole('checkbox')).toHaveLength(data.length + 1);
    expect(
      screen.getByRole('checkbox', { name: /select all/i })
    ).toBeInTheDocument();
  });

  it('select-all toggles every loaded row', async () => {
    render(<SelectableTable />);

    await userEvent.click(
      screen.getByRole('checkbox', { name: /select all/i })
    );

    const rowCheckboxes = screen.getAllByRole('checkbox', {
      name: /select row/i,
    });
    expect(rowCheckboxes).toHaveLength(data.length);
    for (const checkbox of rowCheckboxes) {
      expect(checkbox).toBeChecked();
    }
    expect(screen.getByRole('checkbox', { name: /select all/i })).toBeChecked();
  });

  it('toggling an individual row updates the controlled selection via the callback', async () => {
    const onChange = vi.fn();
    render(<SelectableTable onChange={onChange} />);

    const rowCheckboxes = screen.getAllByRole('checkbox', {
      name: /select row/i,
    });
    await userEvent.click(rowCheckboxes[0]);

    expect(rowCheckboxes[0]).toBeChecked();
    expect(rowCheckboxes[1]).not.toBeChecked();
    expect(onChange).toHaveBeenCalled();

    // The latest controlled selection has exactly one row selected.
    const latest = onChange.mock.calls.at(-1)?.[0] as RowSelectionState;
    expect(Object.values(latest).filter(Boolean)).toHaveLength(1);
  });

  it('clears the selection when select-all is toggled off', async () => {
    render(<SelectableTable />);

    const selectAll = screen.getByRole('checkbox', { name: /select all/i });
    await userEvent.click(selectAll);
    await userEvent.click(selectAll);

    for (const checkbox of screen.getAllByRole('checkbox', {
      name: /select row/i,
    })) {
      expect(checkbox).not.toBeChecked();
    }
  });
});
