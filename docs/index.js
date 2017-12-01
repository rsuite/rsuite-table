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
        <a id="README" className="target-fix" ></a>
        <Markdown>{require('../README.md')}</Markdown>

        <h2 id="examples" >示例</h2>
        <a id="FixedColumnTable" className="target-fix" ></a>

        <CodeView
          source={require('./md/FixedColumnTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />


        <a id="ResizableColumnTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/ResizableColumnTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />

        <a id="FluidColumnTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/FluidColumnTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />

        <a id="WordWrapTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/WordWrapTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />

        <a id="CustomColumnTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/CustomColumnTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell,
            Popover,
            Whisper
          }}
        />

        <a id="SortTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/SortTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />

        <a id="PaginationTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/PaginationTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell,
            TablePagination
          }}
        />


        <a id="TreeTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/TreeTable.md')}
          dependencies={{
            fakeData: fakeTreeData,
            Table,
            Column,
            Cell,
            Toggle,
            HeaderCell
          }}
        />

        <a id="EditTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/EditTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell,
            _
          }}
        />

        <a id="LoadingTable" className="target-fix" ></a>
        <CodeView
          source={require('./md/LoadingTable.md')}
          dependencies={{
            fakeData,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />

        <a id="ColspanTable" className="target-fix" ></a>

        <CodeView
          source={require('./md/ColspanTable.md')}
          dependencies={{
            fakeData: fakeDataForColSpan,
            Table,
            Column,
            Cell,
            HeaderCell
          }}
        />

        <a id="API" className="target-fix" ></a>
        <h2>API</h2>
        <Markdown>{require('./md/props.md')}</Markdown>
      </PageContainer>
    );
  }
}

ReactDOM.render(<App />,
  document.getElementById('app')
);
