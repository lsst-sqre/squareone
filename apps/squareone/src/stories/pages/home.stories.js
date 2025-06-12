import Home from '../../pages/index';

export default {
  title: 'Pages/Homepage',
  component: Home,
};

const Template = (args) => <Home {...args} />;

export const Homepage = Template.bind();
Homepage.args = {
  publicRuntimeConfig: {
    siteName: 'Rubin Science Platform',
  },
};
