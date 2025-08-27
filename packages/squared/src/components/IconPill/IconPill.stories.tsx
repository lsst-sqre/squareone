import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconPill } from './IconPill';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faBook } from '@fortawesome/free-solid-svg-icons';

// Add icons to the global Font Awesome library
library.add(faBook);

const meta: Meta<typeof IconPill> = {
  title: 'Components/IconPill',
  component: IconPill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconPill>;

export const Default: Story = {
  args: {
    icon: ['fas', 'book'],
    text: 'Documentation',
    url: '#',
    textColor: '#ffffff',
    backgroundColor: 'var(--sqo-primary-button-background-color)',
    hoverBackgroundColor: 'var(--sqo-primary-button-background-color-hover)',
  },

  render: ({
    icon,
    text,
    url,
    textColor,
    backgroundColor,
    hoverBackgroundColor,
  }) => {
    return (
      <IconPill
        icon={icon}
        text={text}
        url={url}
        textColor={textColor}
        backgroundColor={backgroundColor}
        hoverBackgroundColor={hoverBackgroundColor}
      />
    );
  },
};
