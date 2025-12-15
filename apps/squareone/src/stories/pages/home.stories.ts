import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HomepageHero from '../../components/HomepageHero';

const meta: Meta<typeof HomepageHero> = {
  title: 'Pages/Homepage',
  component: HomepageHero,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Homepage: Story = {
  args: {},
};
