
// 解决 IE 11 兼容性问题
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Header, Navbar, Nav, Row, Col } from 'rsuite';
import Affix from 'rsuite-affix';
import { Markdown } from 'markdownloader';

import FixedColumnTable from './examples/FixedColumnTable';
import PaginationTable from './examples/PaginationTable';
import ResizableColumnTable from './examples/ResizableColumnTable';
import CustomColumnTable from './examples/CustomColumnTable';
import TreeTable from './examples/TreeTable';
import FluidColumnTable from './examples/FluidColumnTable';
import SortTable from './examples/SortTable';

import '../src/less/index.less';
import './less/index.less';

const App = React.createClass({

  render() {

    return (
      <div className="doc-page">

        <Header inverse>
          <div className="container">
            <Navbar.Header>
              <Navbar.Brand>
                <a href="#"><span className="prefix">R</span>Suite  Table</a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>

              <Nav pullRight>
                <Nav.Item href="https://rsuite.github.io">RSuite</Nav.Item>
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
                  <Nav.Item href="#CustomColumnTable">&nbsp;&nbsp;- 自定义单元格</Nav.Item>
                  <Nav.Item href="#SortTable">&nbsp;&nbsp;- 排序</Nav.Item>
                  <Nav.Item href="#PaginationTable">&nbsp;&nbsp;- 分页</Nav.Item>
                  <Nav.Item href="#TreeTable">&nbsp;&nbsp;- 树形表格</Nav.Item>
                  <Nav.Item href="#API"># API</Nav.Item>
                </Nav>
              </Affix>
            </Col>
            <Col md={10}>

              <a id="README" className="target-fix" ></a>
              <Markdown>{require('../README.md')}</Markdown>

              <h2 id="examples" ># 示例</h2>
              <a id="FixedColumnTable" className="target-fix" ></a>
              <h3 >锁定列: 固定表头,固定前两列 </h3>
              <FixedColumnTable />
              <Markdown>{require('./md/FixedColumnTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/FixedColumnTable.js" target="_blank" >示例代码</a></p>
              <hr />


              <a id="ResizableColumnTable" className="target-fix" ></a>
              <h3 >自定义调整列宽 </h3>
              <ResizableColumnTable />
              <Markdown>{require('./md/ResizableColumnTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/ResizableColumnTable.js" target="_blank" >示例代码</a></p>
              <hr />


              <a id="FluidColumnTable" className="target-fix" ></a>
              <h3 >自动列宽 </h3>
              <FluidColumnTable />
              <Markdown>{require('./md/FluidColumnTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/FluidColumnTable.js" target="_blank" >示例代码</a></p>

              <hr />

              <a id="CustomColumnTable" className="target-fix" ></a>
              <h3 >自定义单元格 </h3>
              <CustomColumnTable />
              <Markdown>{require('./md/CustomColumnTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/CustomColumnTable.js" target="_blank" >示例代码</a></p>
              <hr />

              <a id="SortTable" className="target-fix" ></a>
              <h3 >排序 </h3>
              <SortTable />
              <Markdown>{require('./md/SortTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/SortTable.js" target="_blank" >示例代码</a></p>
              <hr />

              <a id="PaginationTable" className="target-fix" ></a>
              <h3 >分页 </h3>
              <PaginationTable />
              <Markdown>{require('./md/PaginationTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/PaginationTable.js" target="_blank" >示例代码</a></p>
              <hr />

              <a id="TreeTable" className="target-fix" ></a>
              <h3 >树形表格</h3>
              <TreeTable />
              <Markdown>{require('./md/TreeTable.md')}</Markdown>
              <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/TreeTable.js" target="_blank" >示例代码</a></p>


              <a id="API" className="target-fix" ></a>
              <h3 ># API </h3>
              <Markdown>
                {
                  require('./md/props.md')
                }
              </Markdown>

            </Col>

          </Row>

        </div>

      </div>

    );
  }
});

ReactDOM.render(<App />,
  document.getElementById('app')
);
