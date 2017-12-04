// 解决 IE 11 兼容性问题
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Popover, Whisper, Toggle } from 'rsuite';
import { Markdown } from 'react-markdown-reader';
import CodeView from 'react-code-view';
import _ from 'lodash';
import { PageContainer } from 'rsuite-docs';

import 'react-code-view/lib/less/index.less';
import './less/index.less';


import { Table, Column, Cell, HeaderCell, TablePagination } from '../src';
import fakeData from './data/users';
import fakeTreeData from './data/treeData';
import fakeDataForColSpan from './data/usersForColSpan';

class App extends React.Component {
  render() {
    return (
      <PageContainer
        githubURL="https://github.com/rsuite/rsuite-table"
        activeKey="Table"
      >

        <Markdown>{require('../README.md')}</Markdown>

        <h2 id="examples" >示例</h2>
        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/FixedColumnTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/ResizableColumnTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/FluidColumnTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/WordWrapTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell,
            Popover,
            Whisper
          }}
        >
          {require('./md/CustomColumnTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/SortTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell,
            TablePagination
          }}
        >
          {require('./md/PaginationTable.md')}
        </CodeView>


        <CodeView
          dependencies={{
            fakeData: fakeTreeData,
            Table,
            Column,
            Cell,
            Toggle,
            HeaderCell
          }}
        >
          {require('./md/TreeTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell,
            _
          }}
        >
          {require('./md/EditTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/LoadingTable.md')}
        </CodeView>

        <CodeView
          dependencies={{
            fakeData: fakeDataForColSpan,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        >
          {require('./md/ColspanTable.md')}
        </CodeView>

        <Markdown>
          {require('./md/props.md')}
        </Markdown>
      </PageContainer>
    );
  }
}

ReactDOM.render(<App />,
  document.getElementById('app')
);
