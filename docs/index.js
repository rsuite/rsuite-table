import React from 'react';
import ReactDOM from 'react-dom';
import { Popover, Whisper, Toggle, Grid, Button, ButtonGroup, Checkbox } from 'rsuite';
import clone from 'lodash/clone';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import without from 'lodash/without';
import Examples from './Examples';
import './less/index.less';
import { Table, Column, Cell, HeaderCell } from '../src';
import fakeData from './data/users';
import fakeTreeData from './data/treeData';
import fakeDataForColSpan from './data/usersForColSpan';
import fakeLargeData from './data/fakeLargeData.json';
import fakeObjectDataListStore, { createFakeRowObjectData } from './data/fakeObjectDataListStore';

class App extends React.Component {
  render() {
    return (
      <Grid>
        <h1>rsuite-table</h1>
        <p>A React table component</p>
        <p>
          <a href="https://github.com/rsuite/rsuite-table">
            https://github.com/rsuite/rsuite-table
          </a>
        </p>
        <hr />
        <Examples
          dependencies={{
            Checkbox,
            Button,
            ButtonGroup,
            Popover,
            Whisper,
            Toggle,
            fakeData,
            fakeTreeData,
            fakeLargeData,
            fakeDataForColSpan,
            Table,
            Column,
            Cell,
            HeaderCell,
            clone,
            createFakeRowObjectData,
            fakeObjectDataListStore,
            isFunction,
            get,
            without
          }}
          list={[
            {
              title: 'Virtualized',
              content: require('./md/LargeLists.md')
            },
            {
              title: 'Fixed Column',
              content: require('./md/FixedColumnTable.md')
            },
            {
              title: 'Automatic height',
              content: require('./md/AutoHeightTable.md')
            },
            {
              title: 'Fluid',
              content: require('./md/FluidColumnTable.md')
            },
            {
              title: 'Resizable',
              content: require('./md/ResizableColumnTable.md')
            },
            {
              title: 'Word wrap',
              content: require('./md/WordWrapTable.md')
            },
            {
              title: 'Custom Cell',
              content: require('./md/CustomColumnTable.md')
            },
            {
              title: 'Sort',
              content: require('./md/SortTable.md')
            },
            {
              title: 'Tree',
              content: require('./md/TreeTable.md')
            },
            {
              title: 'Expandable',
              content: require('./md/Expanded.md')
            },
            {
              title: 'Editable',
              content: require('./md/EditTable.md')
            },
            {
              title: 'Loading',
              content: require('./md/LoadingTable.md')
            },
            {
              title: 'Colspan Cell',
              content: require('./md/ColspanTable.md')
            },
            {
              title: 'Hidden header',
              content: require('./md/HideTableHeader.md')
            },
            {
              title: 'Empty',
              content: require('./md/EmptyDataTable.md')
            },
            {
              title: 'Dynamic',
              content: require('./md/DynamicTable.md')
            }
          ]}
        />
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
