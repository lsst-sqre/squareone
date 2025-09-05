import MobileMenuToggle from './MobileMenuToggle';

export default {
  title: 'Components/SidebarLayout/MobileMenuToggle',
  component: MobileMenuToggle,
};

export const Closed = {
  args: {
    isOpen: false,
    onClick: () => console.log('Menu toggle clicked'),
  },
};

export const Open = {
  args: {
    isOpen: true,
    onClick: () => console.log('Menu toggle clicked'),
  },
};

export const MobileViewport = {
  args: {
    isOpen: false,
    onClick: () => console.log('Menu toggle clicked'),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
};
