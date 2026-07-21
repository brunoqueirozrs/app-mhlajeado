import { render, fireEvent, screen } from '@testing-library/react';
import { test } from 'vitest';
import React from 'react';
import GestaoPessoasPage from './src/components/GestaoPessoasPage';

test('renders disc without crashing', () => {
  const mockVendors = [{ id: "v1", nome: "Ana Paula Rodrigues" }];
  const { getByText } = render(<GestaoPessoasPage vendors={mockVendors} loggedUser="Ana Paula Rodrigues" isAdmin={true} />);
  
  // Click the DISC module
  const discBtn = screen.getByText("DISC & Perfil Animal");
  fireEvent.click(discBtn);
  
  console.log("CLICKED DISC OK");
  
  // Wait to see if it renders
  screen.getByText("Teste DISC & Perfil Animal");
});
