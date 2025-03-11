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
