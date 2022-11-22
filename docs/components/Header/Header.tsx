import React from 'react';
import { Stack, IconButton } from 'rsuite';
import GithubIcon from '@rsuite/icons/legacy/Github';
import HeartIcon from '@rsuite/icons/legacy/HeartO';

const Header = () => {
  return (
    <Stack className="header" spacing={8}>
      <a href="https://www.npmjs.com/package/rsuite-table" target="_blank" rel="noreferrer">
        <img alt="npm" src="https://img.shields.io/npm/v/rsuite-table?style=for-the-badge" />
      </a>
      <IconButton
        icon={<HeartIcon style={{ fontSize: 20 }} color="red" />}
        href="https://opencollective.com/rsuite"
        target="_blank"
      />
      <IconButton
        icon={<GithubIcon style={{ fontSize: 20 }} />}
        href="https://github.com/rsuite/rsuite-table"
        target="_blank"
      />
    </Stack>
  );
};

export default Header;
