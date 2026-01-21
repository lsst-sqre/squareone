/**
 * Tests for query key factory.
 */
import { describe, expect, it } from 'vitest';

import { timesSquareKeys } from './query-keys';

describe('timesSquareKeys', () => {
  describe('all', () => {
    it('returns root key', () => {
      expect(timesSquareKeys.all).toEqual(['times-square']);
    });
  });

  describe('pages', () => {
    it('returns pages root key', () => {
      expect(timesSquareKeys.pages()).toEqual(['times-square', 'pages']);
    });
  });

  describe('pageList', () => {
    it('returns page list key', () => {
      expect(timesSquareKeys.pageList()).toEqual([
        'times-square',
        'pages',
        'list',
      ]);
    });
  });

  describe('page', () => {
    it('returns page key with name', () => {
      expect(timesSquareKeys.page('summit-weather')).toEqual([
        'times-square',
        'pages',
        'summit-weather',
      ]);
    });

    it('handles different page names', () => {
      expect(timesSquareKeys.page('page1')).not.toEqual(
        timesSquareKeys.page('page2')
      );
    });
  });

  describe('htmlStatus', () => {
    it('returns html status root key', () => {
      expect(timesSquareKeys.htmlStatus()).toEqual([
        'times-square',
        'html-status',
      ]);
    });
  });

  describe('htmlStatusForPage', () => {
    it('returns html status key with page name', () => {
      expect(timesSquareKeys.htmlStatusForPage('summit-weather')).toEqual([
        'times-square',
        'html-status',
        'summit-weather',
        {},
      ]);
    });

    it('includes params in key', () => {
      const params = { units: 'metric', days: '7' };
      expect(
        timesSquareKeys.htmlStatusForPage('summit-weather', params)
      ).toEqual(['times-square', 'html-status', 'summit-weather', params]);
    });

    it('different params produce different keys', () => {
      const key1 = timesSquareKeys.htmlStatusForPage('page', { a: '1' });
      const key2 = timesSquareKeys.htmlStatusForPage('page', { a: '2' });
      expect(key1).not.toEqual(key2);
    });
  });

  describe('github', () => {
    it('returns github root key', () => {
      expect(timesSquareKeys.github()).toEqual(['times-square', 'github']);
    });
  });

  describe('githubContents', () => {
    it('returns github contents key', () => {
      expect(timesSquareKeys.githubContents()).toEqual([
        'times-square',
        'github',
        'contents',
      ]);
    });
  });

  describe('githubPage', () => {
    it('returns github page key with path', () => {
      expect(timesSquareKeys.githubPage('org/repo/notebook')).toEqual([
        'times-square',
        'github',
        'page',
        'org/repo/notebook',
      ]);
    });
  });

  describe('githubHtmlStatus', () => {
    it('returns github html status key', () => {
      expect(timesSquareKeys.githubHtmlStatus('org/repo/notebook')).toEqual([
        'times-square',
        'github',
        'html-status',
        'org/repo/notebook',
        {},
      ]);
    });

    it('includes params', () => {
      const params = { ts_hide_code: '1' };
      expect(
        timesSquareKeys.githubHtmlStatus('org/repo/notebook', params)
      ).toEqual([
        'times-square',
        'github',
        'html-status',
        'org/repo/notebook',
        params,
      ]);
    });
  });

  describe('githubPr', () => {
    it('returns github pr root key', () => {
      expect(timesSquareKeys.githubPr()).toEqual(['times-square', 'github-pr']);
    });
  });

  describe('githubPrContents', () => {
    it('returns github pr contents key', () => {
      expect(
        timesSquareKeys.githubPrContents('owner', 'repo', 'abc123')
      ).toEqual([
        'times-square',
        'github-pr',
        'contents',
        'owner',
        'repo',
        'abc123',
      ]);
    });
  });

  describe('githubPrPage', () => {
    it('returns github pr page key', () => {
      expect(
        timesSquareKeys.githubPrPage('owner', 'repo', 'abc123', 'dir/notebook')
      ).toEqual([
        'times-square',
        'github-pr',
        'page',
        'owner',
        'repo',
        'abc123',
        'dir/notebook',
      ]);
    });
  });

  describe('githubPrHtmlStatus', () => {
    it('returns github pr html status key', () => {
      expect(
        timesSquareKeys.githubPrHtmlStatus(
          'owner',
          'repo',
          'abc123',
          'dir/notebook'
        )
      ).toEqual([
        'times-square',
        'github-pr',
        'html-status',
        'owner',
        'repo',
        'abc123',
        'dir/notebook',
        {},
      ]);
    });

    it('includes params', () => {
      const params = { units: 'imperial' };
      expect(
        timesSquareKeys.githubPrHtmlStatus(
          'owner',
          'repo',
          'abc123',
          'dir/notebook',
          params
        )
      ).toEqual([
        'times-square',
        'github-pr',
        'html-status',
        'owner',
        'repo',
        'abc123',
        'dir/notebook',
        params,
      ]);
    });
  });

  describe('key hierarchy', () => {
    it('page key starts with pages key', () => {
      expect(timesSquareKeys.page('name').slice(0, 2)).toEqual(
        timesSquareKeys.pages()
      );
    });

    it('htmlStatusForPage starts with htmlStatus key', () => {
      expect(timesSquareKeys.htmlStatusForPage('name').slice(0, 2)).toEqual(
        timesSquareKeys.htmlStatus()
      );
    });

    it('githubContents starts with github key', () => {
      expect(timesSquareKeys.githubContents().slice(0, 2)).toEqual(
        timesSquareKeys.github()
      );
    });

    it('githubPrContents starts with githubPr key', () => {
      expect(
        timesSquareKeys.githubPrContents('o', 'r', 'c').slice(0, 2)
      ).toEqual(timesSquareKeys.githubPr());
    });

    it('all keys start with root key', () => {
      expect(timesSquareKeys.pages()[0]).toBe('times-square');
      expect(timesSquareKeys.htmlStatus()[0]).toBe('times-square');
      expect(timesSquareKeys.github()[0]).toBe('times-square');
      expect(timesSquareKeys.githubPr()[0]).toBe('times-square');
    });
  });
});
