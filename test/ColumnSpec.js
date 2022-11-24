import React from 'react';
import Column from '../src/Column';
import { render } from '@testing-library/react';

describe('Column', () => {
  it('Should output a null', () => {
    const { container } = render(<Column />);

    expect(container.innerHTML).to.be.equal('');
  });
});
