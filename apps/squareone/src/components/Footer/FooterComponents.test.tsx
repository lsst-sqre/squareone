import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { FooterNav } from './FooterComponents';

test('FooterNav names its navigation landmark "Footer"', () => {
  // Naming the landmark distinguishes it from the header "Main" nav so axe
  // landmark-unique passes when both navs are present on a page.
  render(
    <FooterNav>
      <a href="/terms">Acceptable use policy</a>
    </FooterNav>
  );

  expect(
    screen.getByRole('navigation', { name: 'Footer' })
  ).toBeInTheDocument();
});
