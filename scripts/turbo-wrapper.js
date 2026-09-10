#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const TURBO_CMD = 'turbo';
const OP_ENV_FILE = '.env.op';
const PLAIN_ENV_FILE = '.env';

function checkCommandExists(command) {
  return new Promise((resolve) => {
    const proc = spawn(`${command} --version`, {
      stdio: 'ignore',
      shell: true,
    });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}

async function runTurbo(args) {
  const rootDir = resolve(__dirname, '..');
  const opEnvPath = resolve(rootDir, OP_ENV_FILE);
  const plainEnvPath = resolve(rootDir, PLAIN_ENV_FILE);

  let command, commandArgs;

  // Priority 1: Check for pre-set environment variables
  if (
    process.env.TURBO_API &&
    process.env.TURBO_TOKEN &&
    process.env.TURBO_TEAM
  ) {
    console.log(
      '🔑 Using environment variables for Turborepo remote cache authentication'
    );
    command = TURBO_CMD;
    commandArgs = args;
  }
  // Priority 2: Check for 1Password CLI with .env.op
  else if (existsSync(opEnvPath)) {
    const opAvailable = await checkCommandExists('op');

    if (opAvailable) {
      console.log(
        '🔐 Using 1Password for Turborepo remote cache authentication'
      );
      command = 'op';
      commandArgs = [
        'run',
        '--account=lsstit.1password.com',
        '--env-file',
        OP_ENV_FILE,
        '--',
        TURBO_CMD,
        ...args,
      ];
    } else {
      console.warn('⚠️  .env.op found but 1Password CLI not available');
      console.warn('   Install with: brew install 1password-cli');
      console.warn('   Falling back to unauthenticated mode...\n');
      command = TURBO_CMD;
      commandArgs = args;
    }
  }
  // Priority 3: Check for plain .env file
  else if (existsSync(plainEnvPath)) {
    console.log('🔑 Using .env for Turborepo remote cache authentication');
    // Load .env file manually
    require('dotenv').config({ path: plainEnvPath });
    command = TURBO_CMD;
    commandArgs = args;
  }
  // Priority 4: No authentication
  else {
    console.log('ℹ️  Running Turborepo without remote cache (local cache only)');
    command = TURBO_CMD;
    commandArgs = args;
  }

  // Spawn the turbo process. Join the command line ourselves: with
  // `shell: true` Node would concatenate the args anyway, and Node 24 warns
  // (DEP0190) when handed an args array alongside the shell option.
  const proc = spawn([command, ...commandArgs].join(' '), {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  });

  proc.on('exit', (code) => {
    process.exit(code);
  });
}

// Get turbo args from command line
const turboArgs = process.argv.slice(2);

if (turboArgs.length === 0) {
  console.error('Usage: node turbo-wrapper.js <turbo-command> [args...]');
  process.exit(1);
}

runTurbo(turboArgs);
