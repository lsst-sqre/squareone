import { Card, CardGroup } from '@lsst-sqre/squared';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useId } from 'react';

import type { OperatorLink } from '../../lib/admin/overview';
import styles from './AdminOverview.module.css';
import linkStyles from './OperatorLinks.module.css';

type OperatorLinksProps = {
  /** The links to show, in order (see `getOperatorLinks`). */
  links: OperatorLink[];
};

/**
 * The overview's Operator links section: a card for each operator tool
 * (Argo CD, Chronograf, Kafdrop) that discovery lists, the environment's
 * Phalanx documentation, and the raw discovery document.
 *
 * Each card's title links to the tool itself. A tool with its own
 * documentation adds a secondary documentation link, so the card is not
 * wrapped in a single link the way the `/docs` page's dataset cards are.
 */
export default function OperatorLinks({ links }: OperatorLinksProps) {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>Operator links</h2>
      <CardGroup className={linkStyles.cards} minCardWidth="15rem">
        {links.map((link) => (
          <Card key={link.id} className={linkStyles.card}>
            <h3 className={linkStyles.title}>
              <a className={linkStyles.titleLink} href={link.url}>
                {link.label}
                <ArrowUpRight
                  className={linkStyles.icon}
                  size={16}
                  aria-hidden="true"
                />
              </a>
            </h3>
            <p className={linkStyles.description}>{link.description}</p>
            {link.docsUrl ? (
              <a
                className={linkStyles.docsLink}
                href={link.docsUrl}
                aria-label={`${link.label} documentation`}
              >
                <BookOpen size={16} aria-hidden="true" />
                Documentation
              </a>
            ) : null}
          </Card>
        ))}
      </CardGroup>
    </section>
  );
}
