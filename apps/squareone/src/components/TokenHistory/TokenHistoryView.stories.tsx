import React from 'react';
import TokenHistoryView from './TokenHistoryView';

export default {
  title: 'Components/TokenHistory/TokenHistoryView',
  component: TokenHistoryView,
  parameters: {
    layout: 'padded',
  },
};

/**
 * Note: These stories require hooks to be mocked in the actual application.
 * For demonstration purposes, they show the component structure.
 * In a real implementation, you would use MSW or similar for API mocking.
 */

// Default view with history entries and no filters
export const Default = {
  args: {
    username: 'testuser',
    showFilters: false,
  },
};

// Loading state placeholder
export const Loading = {
  args: {
    username: 'testuser',
    showFilters: false,
  },
};

// History page mode with filter controls shown
export const WithFilters = {
  args: {
    username: 'testuser',
    initialTokenType: 'user',
    showFilters: true,
  },
};

// Details page mode: pre-filtered to single token, no filter controls
export const TokenDetailsMode = {
  args: {
    username: 'testuser',
    token: 'abc123xyz456789012345',
    showFilters: false,
  },
};
