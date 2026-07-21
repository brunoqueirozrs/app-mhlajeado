import { render } from '@testing-library/react';
import React from 'react';
import GestaoPessoasPage from './src/components/GestaoPessoasPage.js';

try {
  render(React.createElement(GestaoPessoasPage));
  console.log('RENDER SUCCESSFUL');
} catch (err) {
  console.error('RENDER FAILED:', err);
}
