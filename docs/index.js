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
            {
              title: '锁定列',
              content: require('./md/FixedColumnTable.md')
            },
            {
              title: '调整列宽',
              content: require('./md/ResizableColumnTable.md')
            },
            {
              title: '自动列宽',
              content: require('./md/FluidColumnTable.md')
            },
            {
              title: '自动换行',
              content: require('./md/WordWrapTable.md')
            },
            {
              title: '自定义单元格',
              content: require('./md/CustomColumnTable.md')
            },
            {
              title: '排序',
              content: require('./md/SortTable.md')
            },
            {
              title: '树',
              content: require('./md/TreeTable.md')
            },
            {
              title: '可展开',
              content: require('./md/Expanded.md')
            },
            {
              title: '可编辑',
              content: require('./md/EditTable.md')
            },
            {
              title: '加载中',
              content: require('./md/LoadingTable.md')
            },
            {
              title: '合并列单元格',
              content: require('./md/ColspanTable.md')
            }
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
