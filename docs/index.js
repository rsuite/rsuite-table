// 解决 IE 11 兼容性问题
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Header, Navbar, Nav, Row, Col, Popover, Whisper, Toggle } from 'rsuite';
import Affix from 'rsuite-affix';
import { Markdown } from 'react-markdown-reader';
import CodeView from 'react-code-view';
import _ from 'lodash';


import 'react-code-view/lib/less/index.less';
import '../src/less/index.less';
import './less/index.less';


import { Table, Column, Cell, HeaderCell, TablePagination } from '../src';
import fakeData from './data/users';
import fakeTreeData from './data/treeData';
import fakeDataForColSpan from './data/usersForColSpan';

class App extends React.Component {
  render() {
    return (
      <div className="doc-page">

        <Header inverse>
          <div className="container">
            <Navbar.Header>
              <Navbar.Brand>
                <a href="#">RSUITE Table</a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>

              <Nav pullRight>
                <Nav.Item href="https://rsuite.github.io">RSUITE</Nav.Item>
                <Nav.Item href="https://github.com/rsuite/rsuite-table">GitHub</Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Header>

        <div className="container">

          <Row>
            <Col md={2} xsHidden smHidden>
              <Affix offsetTop={70}>
                <Nav pills stacked className="sidebar">
                  <Nav.Item href="#README"># 概述</Nav.Item>
                  <Nav.Item href="#examples"># 示例</Nav.Item>
                  <Nav.Item href="#FixedColumnTable">&nbsp;&nbsp;- 锁定列</Nav.Item>
                  <Nav.Item href="#ResizableColumnTable">&nbsp;&nbsp;- 自定义调整列宽</Nav.Item>
                  <Nav.Item href="#FluidColumnTable">&nbsp;&nbsp;- 自动列宽</Nav.Item>
                  <Nav.Item href="#WordWrapTable">&nbsp;&nbsp;- 自动换行</Nav.Item>
                  <Nav.Item href="#CustomColumnTable">&nbsp;&nbsp;- 自定义单元格</Nav.Item>
                  <Nav.Item href="#SortTable">&nbsp;&nbsp;- 排序</Nav.Item>
                  <Nav.Item href="#PaginationTable">&nbsp;&nbsp;- 分页</Nav.Item>
                  <Nav.Item href="#TreeTable">&nbsp;&nbsp;- 树形表格</Nav.Item>
                  <Nav.Item href="#EditTable">&nbsp;&nbsp;- 可编辑的表格</Nav.Item>
                  <Nav.Item href="#LoadingTable">&nbsp;&nbsp;- 加载中...</Nav.Item>
                  <Nav.Item href="#ColspanTable">&nbsp;&nbsp;- 合并列单元格</Nav.Item>

                  <Nav.Item href="#API"># API</Nav.Item>
                </Nav>
              </Affix>
            </Col>
            <Col md={10}>

              <a id="README" className="target-fix" ></a>
              <Markdown>{require('../README.md')}</Markdown>

              <h2 id="examples" ># 示例</h2>
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
              <h3 ># API </h3>
              <Markdown>{require('./md/props.md')}</Markdown>

            </Col>

          </Row>

        </div>

      </div>

    );
  }
}

ReactDOM.render(<App />,
  document.getElementById('app')
);
