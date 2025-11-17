import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

type GitHubPrTitleProps = {
  /**
   * Owner of the GitHub repository.
   */
  owner?: string;
  /**
   * Name of the GitHub repository.
   */
  repo?: string;
  /**
   * The commit SHA corresponding to the GitHub check run.
   */
  commit?: string;
};

/**
 * Header component for the `TimesSquarePrGitHubNav` panel.
 */
export default function GitHubPrTitle({
  owner,
  repo,
  commit,
}: GitHubPrTitleProps) {
  return (
    <StyledHeader>
      <p className="subtitle">PR Preview</p>

      <h2>
        <HiddenLink
          href={`https://github.com/${owner}/${repo}/`}
        >{`${owner}/${repo}`}</HiddenLink>
      </h2>
      <p>
        <StyledFontAwesomeIcon icon="code-commit" /> {commit?.slice(0, 7)}
      </p>
    </StyledHeader>
  );
}

const StyledHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  p,
  h2 {
    margin: 0;
  }

  h2 {
    line-height: 1.2;
    font-size: 1.1rem;
  }

  .subtitle {
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }
`;

const HiddenLink = styled.a`
  color: inherit;
  text-decoration: none;

  :hover {
    color: inherit;
    text-decoration: underline;
  }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.2em;
`;
