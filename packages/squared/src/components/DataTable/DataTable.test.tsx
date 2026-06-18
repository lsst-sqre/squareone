import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('applies a custom className to the table wrapper', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
