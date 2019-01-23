import React from 'react';
import ReactDOM from 'react-dom';
import { Popover, Whisper, Toggle, Grid, Button, ButtonGroup, Checkbox } from 'rsuite';
import { Markdown } from 'react-markdown-reader';
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
import { createFakeRowObjectData } from './data/fakeObjectDataListStore';

class App extends React.Component {
  render() {
    return (
      <Grid>
        <h2>Examples</h2>
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
            isFunction,
            get,
            without
          }}
          list={[
            {
              title: '长表格',
              content: require('./md/LargeLists.md')
            },
            {
              title: '锁定列',
              content: require('./md/FixedColumnTable.md')
            },
            {
              title: '自动高度',
              content: require('./md/AutoHeightTable.md')
            },
            {
              title: '自动列宽',
              content: require('./md/FluidColumnTable.md')
            },
            {
              title: '自定义调整列宽',
              content: require('./md/ResizableColumnTable.md')
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
            },
            {
              title: '隐藏表头',
              content: require('./md/HideTableHeader.md')
            },
            {
              title: '数据为空',
              content: require('./md/EmptyDataTable.md')
            },
            {
              title: '动态加载数据',
              content: require('./md/DynamicTable.md')
            }
          ]}
        />
        <Markdown>{require('../README.md')}</Markdown>
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
