import React from 'react';
import ReactDOM from 'react-dom';
import { Popover, Whisper, Toggle, Grid, Button } from 'rsuite';
import { Markdown } from 'react-markdown-reader';
import clone from 'lodash/clone';
import Examples from './Examples';
import './less/index.less';
import { Table, Column, Cell, HeaderCell } from '../src';
import fakeData from './data/users';
import fakeTreeData from './data/treeData';
import fakeDataForColSpan from './data/usersForColSpan';

class App extends React.Component {
  render() {
    return (
      <Grid>
        <Markdown>{require('../README.md')}</Markdown>
        <h2 id="examples">示例</h2>
        <Examples
          dependencies={{
            Button,
            Popover,
            Whisper,
            Toggle,
            fakeData,
            fakeTreeData,
            fakeDataForColSpan,
            Table,
            Column,
            Cell,
            HeaderCell,
            clone
          }}
          list={[

            require('./md/FixedColumnTable.md'),
            require('./md/ResizableColumnTable.md'),
            /*
            require('./md/FluidColumnTable.md'),
            require('./md/WordWrapTable.md'),
            require('./md/CustomColumnTable.md'),
            require('./md/SortTable.md'),


            require('./md/TreeTable.md'),
            require('./md/Expanded.md'),

            require('./md/EditTable.md'),
            require('./md/LoadingTable.md'),
            require('./md/ColspanTable.md')
            */

          ]}
        />

        <Markdown>{require('./md/props.md')}</Markdown>
      </Grid>
    );
  }
}

/*
if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React);
}
*/

ReactDOM.render(<App />, document.getElementById('app'));
