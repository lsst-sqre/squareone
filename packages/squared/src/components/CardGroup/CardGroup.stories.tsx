import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import Card from '../Card/Card';
import CardGroup from './CardGroup';

const meta: Meta<typeof CardGroup> = {
  title: 'Components/CardGroup',
  component: CardGroup,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', maxWidth: '1200px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CardGroup>
      <a
        href="https://dp0-2.lsst.io/"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Card>
          <h3>Data Preview 0.2 (DP0.2)</h3>
          <p>
            DP0.2 is the second phase of the Data Preview 0 program using
            precursor data.
          </p>
        </Card>
      </a>
      <a
        href="https://dm.lsst.org/sdm_schemas/browser/dp02.html"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Card>
          <h3>DP0.2 Catalog Schema</h3>
          <p>
            Schema reference for the DP0.2 catalog dataset available through
            TAP.
          </p>
        </Card>
      </a>
      <a
        href="https://rsp.lsst.io"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Card>
          <h3>Notebooks</h3>
          <p>
            The Notebook aspect is a powerful data analysis environment with
            Jupyter Notebooks.
          </p>
        </Card>
      </a>
    </CardGroup>
  ),
};

export const CustomMinWidth: Story = {
  render: () => (
    <CardGroup minCardWidth="15rem">
      <Card>
        <h3>Card 1</h3>
        <p>Narrower minimum width</p>
      </Card>
      <Card>
        <h3>Card 2</h3>
        <p>Allows more cards per row</p>
      </Card>
      <Card>
        <h3>Card 3</h3>
        <p>On wider screens</p>
      </Card>
      <Card>
        <h3>Card 4</h3>
        <p>Fourth card</p>
      </Card>
    </CardGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using a smaller minCardWidth allows more cards per row.',
      },
    },
  },
};

export const CustomGap: Story = {
  render: () => (
    <CardGroup gap="2rem">
      <Card>
        <h3>Card 1</h3>
        <p>Larger gap between cards</p>
      </Card>
      <Card>
        <h3>Card 2</h3>
        <p>For more spacing</p>
      </Card>
    </CardGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom gap of 2rem between cards.',
      },
    },
  },
};

export const InteractionTest: Story = {
  render: () => (
    <CardGroup>
      <Card>
        <h3>Test Card 1</h3>
        <p>First card</p>
      </Card>
      <Card>
        <h3>Test Card 2</h3>
        <p>Second card</p>
      </Card>
    </CardGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Test Card 1')).toBeInTheDocument();
    await expect(canvas.getByText('Test Card 2')).toBeInTheDocument();
  },
};
