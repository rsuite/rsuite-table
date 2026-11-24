/* eslint-disable @typescript-eslint/no-require-imports */
const glob = require('glob');
const fs = require('fs');
const { assert } = require('chai');

it('Prepends the `use client` directive to components', () => {
  const libfiles = glob.sync('{lib,es}/**/*.js');

  libfiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    assert.isTrue(content.startsWith(`'use client';`), `File ${file} has 'use client' directive`);
  });

  console.log(`  ✅ ${libfiles.length} files have been validated.`);
});

it('Includes the browser bundle and its source map in the build', () => {
  const bundle = 'dist/rsuite-table.min.js';
  const sourceMap = `${bundle}.map`;
  assert.isTrue(fs.existsSync(bundle), 'The browser bundle is available to package consumers');
  assert.isTrue(
    fs.existsSync(sourceMap),
    'The browser source map is available to package consumers'
  );
  const map = JSON.parse(fs.readFileSync(sourceMap, 'utf8'));
  assert.strictEqual(map.version, 3);
  assert.strictEqual(map.file, 'rsuite-table.min.js');
  assert.isNotEmpty(map.sources);
});
