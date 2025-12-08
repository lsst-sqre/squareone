import { describe, expect, it } from 'vitest';
import {
  ComponentConfigSchema,
  ContextConfigSchema,
  defineConfig,
  FileFactoryConfigSchema,
  HookConfigSchema,
  PageConfigSchema,
  PostCreationMessageSchema,
  parseConfig,
  RouterSchema,
  StyleSystemSchema,
  safeParseConfig,
} from './schema.js';

describe('StyleSystemSchema', () => {
  it('accepts valid style systems', () => {
    expect(StyleSystemSchema.parse('css-modules')).toBe('css-modules');
    expect(StyleSystemSchema.parse('styled-components')).toBe(
      'styled-components'
    );
    expect(StyleSystemSchema.parse('tailwind')).toBe('tailwind');
    expect(StyleSystemSchema.parse('none')).toBe('none');
  });

  it('rejects invalid style systems', () => {
    expect(() => StyleSystemSchema.parse('sass')).toThrow();
    expect(() => StyleSystemSchema.parse('')).toThrow();
  });
});

describe('RouterSchema', () => {
  it('accepts valid routers', () => {
    expect(RouterSchema.parse('app')).toBe('app');
    expect(RouterSchema.parse('pages')).toBe('pages');
  });

  it('rejects invalid routers', () => {
    expect(() => RouterSchema.parse('hybrid')).toThrow();
  });
});

describe('PostCreationMessageSchema', () => {
  it('parses post-creation message config', () => {
    const result = PostCreationMessageSchema.parse({
      message: 'Add export to src/index.ts',
    });

    expect(result.message).toBe('Add export to src/index.ts');
  });

  it('requires message field', () => {
    expect(() => PostCreationMessageSchema.parse({})).toThrow();
  });
});

describe('ComponentConfigSchema', () => {
  it('applies default values', () => {
    const result = ComponentConfigSchema.parse({});

    expect(result.directory).toBe('src/components');
    expect(result.styleSystem).toBe('css-modules');
    expect(result.withTest).toBe(true);
    expect(result.withStory).toBe(false);
    expect(result.appRouterBarrel).toBe(true);
    expect(result.postCreationMessage).toBeUndefined();
  });

  it('accepts custom values', () => {
    const result = ComponentConfigSchema.parse({
      directory: 'src/ui',
      styleSystem: 'styled-components',
      withTest: false,
      withStory: true,
      appRouterBarrel: false,
    });

    expect(result.directory).toBe('src/ui');
    expect(result.styleSystem).toBe('styled-components');
    expect(result.withTest).toBe(false);
    expect(result.withStory).toBe(true);
    expect(result.appRouterBarrel).toBe(false);
  });

  it('accepts postCreationMessage', () => {
    const result = ComponentConfigSchema.parse({
      postCreationMessage: {
        message: 'Add export to src/index.ts',
      },
    });

    expect(result.postCreationMessage?.message).toBe(
      'Add export to src/index.ts'
    );
  });
});

describe('HookConfigSchema', () => {
  it('applies default values', () => {
    const result = HookConfigSchema.parse({});

    expect(result.directory).toBe('src/hooks');
    expect(result.withTest).toBe(true);
    expect(result.useDirectory).toBe(true);
  });
});

describe('ContextConfigSchema', () => {
  it('applies default values', () => {
    const result = ContextConfigSchema.parse({});

    expect(result.directory).toBe('src/contexts');
    expect(result.withTest).toBe(false);
  });
});

describe('PageConfigSchema', () => {
  it('applies default values', () => {
    const result = PageConfigSchema.parse({});

    expect(result.directory).toBe('src/pages');
    expect(result.router).toBe('pages');
  });

  it('accepts app router', () => {
    const result = PageConfigSchema.parse({
      directory: 'src/app',
      router: 'app',
    });

    expect(result.directory).toBe('src/app');
    expect(result.router).toBe('app');
  });
});

describe('FileFactoryConfigSchema', () => {
  it('applies all default values for empty object', () => {
    const result = FileFactoryConfigSchema.parse({});

    expect(result.component.directory).toBe('src/components');
    expect(result.hook.directory).toBe('src/hooks');
    expect(result.context.directory).toBe('src/contexts');
    expect(result.page.directory).toBe('src/pages');
    expect(result.hooks).toEqual({});
  });

  it('merges partial configuration', () => {
    const result = FileFactoryConfigSchema.parse({
      component: {
        styleSystem: 'styled-components',
      },
    });

    expect(result.component.styleSystem).toBe('styled-components');
    expect(result.component.directory).toBe('src/components');
  });
});

describe('defineConfig', () => {
  it('returns validated configuration', () => {
    const config = defineConfig({
      component: {
        styleSystem: 'tailwind',
      },
    });

    expect(config.component.styleSystem).toBe('tailwind');
    expect(config.component.directory).toBe('src/components');
  });

  it('throws on invalid configuration', () => {
    expect(() =>
      defineConfig({
        component: {
          // @ts-expect-error - testing invalid input
          styleSystem: 'invalid',
        },
      })
    ).toThrow();
  });
});

describe('parseConfig', () => {
  it('parses and validates configuration', () => {
    const config = parseConfig({
      hook: {
        useDirectory: true,
      },
    });

    expect(config.hook.useDirectory).toBe(true);
  });
});

describe('safeParseConfig', () => {
  it('returns success result for valid config', () => {
    const result = safeParseConfig({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.component.directory).toBe('src/components');
    }
  });

  it('returns error result for invalid config', () => {
    const result = safeParseConfig({
      component: {
        styleSystem: 'invalid',
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});
