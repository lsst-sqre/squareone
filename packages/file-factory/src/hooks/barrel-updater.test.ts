import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateBarrel, updateBarrels } from './barrel-updater.js';

// Mock the file system operations
vi.mock('node:fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
  existsSync: vi.fn(),
}));

describe('updateBarrel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('creates new barrel file when it does not exist', async () => {
    const mockAccess = vi.mocked(fs.promises.access);
    const mockWriteFile = vi.mocked(fs.promises.writeFile);
    const mockMkdir = vi.mocked(fs.promises.mkdir);

    mockAccess.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await updateBarrel({
      barrelUpdate: {
        file: 'src/index.ts',
        template: "export * from './{{ComponentName}}';\n",
        position: 'append',
        skipIfExists: true,
      },
      variables: { ComponentName: 'Button' },
      packageRoot: '/project',
    });

    expect(result.created).toBe(true);
    expect(result.updated).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.exportLine).toBe("export * from './Button';\n");
  });

  it('updates existing barrel file with append position', async () => {
    const mockAccess = vi.mocked(fs.promises.access);
    const mockReadFile = vi.mocked(fs.promises.readFile);
    const mockWriteFile = vi.mocked(fs.promises.writeFile);
    const mockMkdir = vi.mocked(fs.promises.mkdir);

    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue("export * from './Alert';\n");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await updateBarrel({
      barrelUpdate: {
        file: 'src/index.ts',
        template: "export * from './{{ComponentName}}';\n",
        position: 'append',
        skipIfExists: true,
      },
      variables: { ComponentName: 'Button' },
      packageRoot: '/project',
    });

    expect(result.created).toBe(false);
    expect(result.updated).toBe(true);

    // Verify the write call contains both exports
    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join('/project', 'src/index.ts'),
      expect.stringContaining("export * from './Alert'"),
      'utf-8'
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join('/project', 'src/index.ts'),
      expect.stringContaining("export * from './Button'"),
      'utf-8'
    );
  });

  it('skips update when export already exists', async () => {
    const mockAccess = vi.mocked(fs.promises.access);
    const mockReadFile = vi.mocked(fs.promises.readFile);
    const mockWriteFile = vi.mocked(fs.promises.writeFile);

    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue("export * from './Button';\n");

    const result = await updateBarrel({
      barrelUpdate: {
        file: 'src/index.ts',
        template: "export * from './{{ComponentName}}';\n",
        position: 'append',
        skipIfExists: true,
      },
      variables: { ComponentName: 'Button' },
      packageRoot: '/project',
    });

    expect(result.skipped).toBe(true);
    expect(result.updated).toBe(false);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('does not skip when skipIfExists is false', async () => {
    const mockAccess = vi.mocked(fs.promises.access);
    const mockReadFile = vi.mocked(fs.promises.readFile);
    const mockWriteFile = vi.mocked(fs.promises.writeFile);
    const mockMkdir = vi.mocked(fs.promises.mkdir);

    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue("export * from './Button';\n");
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await updateBarrel({
      barrelUpdate: {
        file: 'src/index.ts',
        template: "export * from './{{ComponentName}}';\n",
        position: 'append',
        skipIfExists: false,
      },
      variables: { ComponentName: 'Button' },
      packageRoot: '/project',
    });

    expect(result.skipped).toBe(false);
    expect(result.updated).toBe(true);
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('respects dry run mode', async () => {
    const mockAccess = vi.mocked(fs.promises.access);
    const mockWriteFile = vi.mocked(fs.promises.writeFile);

    mockAccess.mockRejectedValue(new Error('ENOENT'));

    const result = await updateBarrel({
      barrelUpdate: {
        file: 'src/index.ts',
        template: "export * from './{{ComponentName}}';\n",
        position: 'append',
        skipIfExists: true,
      },
      variables: { ComponentName: 'Button' },
      packageRoot: '/project',
      dryRun: true,
    });

    expect(result.created).toBe(true);
    expect(result.updated).toBe(true);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});

describe('updateBarrels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates multiple barrel files', async () => {
    const mockAccess = vi.mocked(fs.promises.access);
    const mockReadFile = vi.mocked(fs.promises.readFile);
    const mockWriteFile = vi.mocked(fs.promises.writeFile);
    const mockMkdir = vi.mocked(fs.promises.mkdir);

    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue('// existing content\n');
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const results = await updateBarrels(
      [
        {
          file: 'src/index.ts',
          template: "export * from './{{ComponentName}}';\n",
          position: 'append',
          skipIfExists: true,
        },
        {
          file: 'src/components/index.ts',
          template:
            "export { {{ComponentName}} } from './{{ComponentName}}';\n",
          position: 'append',
          skipIfExists: true,
        },
      ],
      { ComponentName: 'Button' },
      '/project'
    );

    expect(results).toHaveLength(2);
    expect(results[0].updated).toBe(true);
    expect(results[1].updated).toBe(true);
  });
});
