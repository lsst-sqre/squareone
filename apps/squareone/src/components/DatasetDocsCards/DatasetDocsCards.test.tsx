import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { DatasetDocsResult } from '../../lib/datasetDocs/types';
import DatasetDocsCards from './DatasetDocsCards';

const okResult: DatasetDocsResult = {
  status: 'ok',
  datasets: [
    {
      datasetKey: 'dp1',
      displayName: 'Data Preview 1',
      description: 'Commissioning camera data.',
      docsUrl: 'https://dp1.lsst.io',
    },
    {
      datasetKey: 'prompt',
      displayName: 'Prompt Products',
      description: 'Prompt products.',
      docsUrl: null,
    },
  ],
};

describe('DatasetDocsCards', () => {
  test('renders nothing, including its children, when the cards are omitted', () => {
    const { container } = render(
      <DatasetDocsCards result={{ status: 'omitted' }}>
        <h2>Data previews</h2>
      </DatasetDocsCards>
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('renders one card per dataset with its display name and description', () => {
    render(<DatasetDocsCards result={okResult} />);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual(['Data Preview 1', 'Prompt Products']);
    expect(screen.getByText('Commissioning camera data.')).toBeInTheDocument();
    expect(screen.getByText('Prompt products.')).toBeInTheDocument();
  });

  test('links a card with a docs URL and leaves one without unlinked', () => {
    render(<DatasetDocsCards result={okResult} />);

    // The only link is the linked card, named by its content.
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://dp1.lsst.io');
    expect(links[0]).toHaveAccessibleName(/Data Preview 1/);

    const promptCard = screen
      .getByRole('heading', { name: 'Prompt Products' })
      .closest('article');
    expect(promptCard?.closest('a')).toBeNull();
  });

  test('renders its children above the cards', () => {
    render(
      <DatasetDocsCards result={okResult}>
        <h2>Data previews</h2>
      </DatasetDocsCards>
    );

    const sectionHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Data previews',
    });
    const firstCard = screen.getAllByRole('article')[0];
    expect(
      sectionHeading.compareDocumentPosition(firstCard) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test('renders its children and a brief notice when discovery failed', () => {
    render(
      <DatasetDocsCards result={{ status: 'unavailable' }}>
        <h2>Data previews</h2>
      </DatasetDocsCards>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Data previews' })
    ).toBeInTheDocument();
    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  test('renders nothing, including its children, when discovery lists no datasets', () => {
    const { container } = render(
      <DatasetDocsCards result={{ status: 'ok', datasets: [] }}>
        <h2>Data previews</h2>
      </DatasetDocsCards>
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('renders the card headings at the given heading level', () => {
    render(<DatasetDocsCards result={okResult} headingLevel={4} />);

    expect(
      screen.getByRole('heading', { level: 4, name: 'Data Preview 1' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });
});
