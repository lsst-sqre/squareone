import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { axe } from 'vitest-axe';
import AppShell from './AppShell';

/**
 * These tests assemble the landmark skeleton of a real page (header nav,
 * complementary banners, main content, footer nav) and assert that axe's
 * `region` and `landmark-unique` rules pass — the two rules called out in the
 * task's acceptance criteria. Naming the landmarks (aria-label) is what keeps
 * multiple same-role landmarks unique, and wrapping the content in a single
 * <main> is what satisfies `region`.
 */

function PageSkeleton({ banners = [] }: { banners?: string[] }) {
  return (
    <div>
      <AppShell
        chrome={
          <>
            <header>
              <nav aria-label="Main">
                <a href="https://example.com/portal">Portal</a>
              </nav>
            </header>
            {banners.map((label) => (
              <aside key={label} aria-label={label}>
                {label}
              </aside>
            ))}
          </>
        }
      >
        <h1>Page title</h1>
        <p>Body content.</p>
      </AppShell>
      <footer>
        <nav aria-label="Footer">
          <a href="https://example.com/terms">Acceptable use policy</a>
        </nav>
      </footer>
    </div>
  );
}

test('region: all content is inside a landmark', async () => {
  const { container } = render(<PageSkeleton />);

  const results = await axe(container, {
    runOnly: ['region'],
  });

  expect(results).toHaveNoViolations();
});

test('landmark-unique: named landmarks are distinct even with multiple banners', async () => {
  // Two complementary banners plus header/footer navs — the exact multi-
  // landmark situation that fires landmark-unique when the landmarks are
  // unnamed.
  const { container } = render(
    <PageSkeleton
      banners={['Scheduled maintenance', 'New feature available']}
    />
  );

  const results = await axe(container, {
    runOnly: ['landmark-unique'],
  });

  expect(results).toHaveNoViolations();
});
