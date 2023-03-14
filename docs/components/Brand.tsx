import React from 'react';

import Logo from './Logo';
import { Stack } from 'rsuite';

const Brand = ({ showText, ...props }) => {
  return (
    <Stack className="brand" {...props}>
      <Logo height={26} width={22.56} style={{ marginTop: 6 }} />
      {showText && <span style={{ marginLeft: 14 }}>rsuite table</span>}
    </Stack>
  );
};

export default Brand;
