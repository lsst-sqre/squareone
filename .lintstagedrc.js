const path = require('path');

module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --write'],
  '*.{yaml,yml,json}': ['prettier --write'],
};
