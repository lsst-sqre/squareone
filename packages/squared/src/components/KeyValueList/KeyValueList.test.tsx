import { render, screen } from '@testing-library/react';
import { KeyValueList } from './KeyValueList';

describe('KeyValueList', () => {
  it('renders definition list element', () => {
    const { container } = render(
      <KeyValueList items={[{ key: 'Test', value: 'Value' }]} />
    );

    const dl = container.querySelector('dl');
    expect(dl).toBeInTheDocument();
  });

  it('renders correct number of key-value pairs', () => {
    const items = [
      { key: 'CPU', value: '4 cores' },
      { key: 'Memory', value: '16 GB' },
      { key: 'Storage', value: '100 GB' },
    ];

    const { container } = render(<KeyValueList items={items} />);

    const terms = container.querySelectorAll('dt');
    const definitions = container.querySelectorAll('dd');

    expect(terms).toHaveLength(3);
    expect(definitions).toHaveLength(3);
  });

  it('displays keys correctly', () => {
    render(
      <KeyValueList
        items={[
          { key: 'CPU', value: '4 cores' },
          { key: 'Memory', value: '16 GB' },
        ]}
      />
    );

    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
  });

  it('displays string values correctly', () => {
    render(
      <KeyValueList
        items={[
          { key: 'CPU', value: '4 cores' },
          { key: 'Memory', value: '16 GB' },
        ]}
      />
    );

    expect(screen.getByText('4 cores')).toBeInTheDocument();
    expect(screen.getByText('16 GB')).toBeInTheDocument();
  });

  it('renders ReactNode values correctly', () => {
    render(
      <KeyValueList
        items={[
          {
            key: 'Status',
            value: <span data-testid="status-badge">Active</span>,
          },
        ]}
      />
    );

    const statusBadge = screen.getByTestId('status-badge');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveTextContent('Active');
  });

  it('handles empty items array', () => {
    const { container } = render(<KeyValueList items={[]} />);

    const dl = container.querySelector('dl');
    expect(dl).toBeInTheDocument();
    expect(dl?.children).toHaveLength(0);
  });

  it('handles single item', () => {
    const { container } = render(
      <KeyValueList items={[{ key: 'Single', value: 'Item' }]} />
    );

    const terms = container.querySelectorAll('dt');
    const definitions = container.querySelectorAll('dd');

    expect(terms).toHaveLength(1);
    expect(definitions).toHaveLength(1);
    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('applies base CSS Module class', () => {
    const { container } = render(
      <KeyValueList items={[{ key: 'Test', value: 'Value' }]} />
    );

    const dl = container.querySelector('dl');
    expect(dl).toHaveClass('keyValueList');
  });

  it('applies CSS classes to terms', () => {
    const { container } = render(
      <KeyValueList items={[{ key: 'Test', value: 'Value' }]} />
    );

    const dt = container.querySelector('dt');
    expect(dt).toHaveClass('term');
  });

  it('applies CSS classes to definitions', () => {
    const { container } = render(
      <KeyValueList items={[{ key: 'Test', value: 'Value' }]} />
    );

    const dd = container.querySelector('dd');
    expect(dd).toHaveClass('definition');
  });

  it('applies custom className', () => {
    const { container } = render(
      <KeyValueList
        items={[{ key: 'Test', value: 'Value' }]}
        className="custom-class"
      />
    );

    const dl = container.querySelector('dl');
    expect(dl).toHaveClass('custom-class');
    expect(dl).toHaveClass('keyValueList');
  });

  it('handles long keys and values', () => {
    const longKey = 'This is a very long key that might wrap';
    const longValue =
      'This is a very long value that demonstrates how the component handles lengthy content';

    render(<KeyValueList items={[{ key: longKey, value: longValue }]} />);

    expect(screen.getByText(longKey)).toBeInTheDocument();
    expect(screen.getByText(longValue)).toBeInTheDocument();
  });

  it('handles special characters in keys and values', () => {
    render(
      <KeyValueList
        items={[
          { key: 'Email@Address', value: 'user@example.com' },
          { key: 'Path/To/File', value: '/home/user/file.txt' },
          { key: 'Price ($)', value: '$99.99' },
        ]}
      />
    );

    expect(screen.getByText('Email@Address')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Path/To/File')).toBeInTheDocument();
    expect(screen.getByText('/home/user/file.txt')).toBeInTheDocument();
    expect(screen.getByText('Price ($)')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('renders multiple ReactNode values', () => {
    render(
      <KeyValueList
        items={[
          {
            key: 'Status 1',
            value: <span data-testid="status-1">Active</span>,
          },
          {
            key: 'Status 2',
            value: <span data-testid="status-2">Pending</span>,
          },
        ]}
      />
    );

    expect(screen.getByTestId('status-1')).toHaveTextContent('Active');
    expect(screen.getByTestId('status-2')).toHaveTextContent('Pending');
  });

  it('maintains semantic HTML structure', () => {
    const { container } = render(
      <KeyValueList
        items={[
          { key: 'Key1', value: 'Value1' },
          { key: 'Key2', value: 'Value2' },
        ]}
      />
    );

    const dl = container.querySelector('dl');
    expect(dl).toBeInTheDocument();

    // Check that dt and dd elements alternate correctly
    const firstDt = dl?.children[0];
    const firstDd = dl?.children[1];
    const secondDt = dl?.children[2];
    const secondDd = dl?.children[3];

    expect(firstDt?.tagName).toBe('DT');
    expect(firstDd?.tagName).toBe('DD');
    expect(secondDt?.tagName).toBe('DT');
    expect(secondDd?.tagName).toBe('DD');
  });
});
