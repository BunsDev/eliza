#!/usr/bin/env bun
/**
 * Dual build script for @elizaos/core - generates both Node.js and browser builds
 */

import { createBuildRunner } from '../../build-utils';
import { existsSync, mkdirSync } from 'node:fs';

// Ensure dist directories exist
['dist', 'dist/node', 'dist/browser'].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Browser-specific externals (these should be provided by the host environment)
const browserExternals = [
  // These will be loaded via CDN or bundled by the consuming app
  '@solana/web3.js',
  'sharp', // Image processing - not available in browser
  '@hapi/shot', // Test utility - not needed in browser
];

// Node-specific externals (native modules and node-specific packages)
const nodeExternals = [
  'dotenv',
  'sharp',
  '@solana/web3.js',
  'zod',
  '@hapi/shot',
  'pino',
  'pino-pretty',
  'crypto-browserify',
  '@sentry/browser',
];

// Shared configuration
const sharedConfig = {
  packageName: '@elizaos/core',
  sourcemap: true,
  minify: false,
  generateDts: true,
};

/**
 * Build for Node.js environment
 */
async function buildNode() {
  console.log('🔨 Building for Node.js...');
  const startTime = Date.now();

  const runNode = createBuildRunner({
    ...sharedConfig,
    buildOptions: {
      entrypoints: ['src/index.node.ts'],
      outdir: 'dist/node',
      target: 'node',
      format: 'esm',
      external: nodeExternals,
      sourcemap: true,
      minify: false,
      generateDts: true,
    },
  });

  await runNode();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Node.js build complete in ${duration}s`);
}

/**
 * Build for browser environment
 */
async function buildBrowser() {
  console.log('🌐 Building for Browser...');
  const startTime = Date.now();

  const runBrowser = createBuildRunner({
    ...sharedConfig,
    buildOptions: {
      entrypoints: ['src/index.browser.ts'],
      outdir: 'dist/browser',
      target: 'browser',
      format: 'esm',
      external: browserExternals,
      sourcemap: true,
      minify: true, // Minify for browser to reduce bundle size
      generateDts: false, // Use the same .d.ts files from Node build
      // Additional browser-specific options
      plugins: [
        {
          name: 'browser-compat',
          setup(build) {
            // Replace Node.js specific modules with browser-compatible versions
            build.onResolve({ filter: /^crypto$/ }, () => ({
              path: 'crypto-browserify',
              external: true,
            }));

            build.onResolve({ filter: /^stream$/ }, () => ({
              path: 'stream-browserify',
              external: true,
            }));

            build.onResolve({ filter: /^buffer$/ }, () => ({
              path: 'buffer',
              external: true,
            }));

            // Stub out Node-only modules
            build.onResolve({ filter: /^fs$/ }, () => ({
              path: 'browserfs',
              external: true,
            }));

            build.onResolve({ filter: /^path$/ }, () => ({
              path: 'path-browserify',
              external: true,
            }));
          },
        },
      ],
    },
  });

  await runBrowser();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Browser build complete in ${duration}s`);
}

/**
 * Build for both targets
 */
async function buildAll() {
  console.log('🚀 Starting dual build process for @elizaos/core\n');
  const totalStart = Date.now();

  try {
    // Build in parallel for speed
    await Promise.all([
      buildNode(),
      buildBrowser(),
    ]);

    const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(2);
    console.log(`\n🎉 All builds complete in ${totalDuration}s`);

    // Create index files that point to the correct build
    await createIndexFiles();

  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

/**
 * Create index files for proper module resolution
 */
async function createIndexFiles() {
  const fs = await import('node:fs/promises');

  // Create main index.js that uses conditional exports
  const mainIndex = `/**
 * Main entry point for @elizaos/core
 * Automatically selects the correct build based on the environment
 */

// This file is not used directly - package.json conditional exports handle the routing
// See package.json "exports" field for the actual entry points
export * from './node/index.node.js';
`;

  await fs.writeFile('dist/index.js', mainIndex);

  // Create a simple index.d.ts that re-exports from the source
  // This approach avoids the complexity of generating declarations from compiled output
  const typeIndex = `// Type definitions for @elizaos/core
// Re-export all types from the source modules

export * from '../src/index';
`;

  await fs.writeFile('dist/index.d.ts', typeIndex);

  // Also ensure the package.json "types" field can resolve correctly
  // by creating fallback declaration files
  await fs.mkdir('dist/node', { recursive: true });
  await fs.mkdir('dist/browser', { recursive: true });

  await fs.writeFile('dist/node/index.d.ts', `export * from '../../src/index.node';`);
  await fs.writeFile('dist/browser/index.d.ts', `export * from '../../src/index.browser';`);

  console.log('📝 Created index files and type definitions for module resolution');
}

// Execute the build
buildAll().catch((error) => {
  console.error('Build script error:', error);
  process.exit(1);
});