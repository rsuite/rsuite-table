
import React from 'react';
import ReactDOM from 'react-dom';
import { Header, Navbar, Nav } from 'rsuite';
import { Markdown } from 'markdownloader';

import '../src/less/index.less';
import './less/index.less';

import FixedColumnTable from './examples/FixedColumnTable';
import PaginationTable from './examples/PaginationTable';
import ResizableColumnTable from './examples/ResizableColumnTable';
import CustomColumnTable from './examples/CustomColumnTable';
import TreeTable from './examples/TreeTable';

const App = React.createClass({

    render() {

        return (
            <div className="doc-page">

                <Header  inverse>
                    <div className="container">
                        <Navbar.Header>
                            <Navbar.Brand>
                                <a href="#"><span className="prefix">R</span>Suite  Table</a>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                        <Navbar.Collapse>
                            <Nav>
                                <Nav.Item href="#examples">示例</Nav.Item>
                                <Nav.Item href="#api">API</Nav.Item>
                            </Nav>
                            <Nav pullRight>
                                <Nav.Item  href="https://rsuite.github.io">RSuite</Nav.Item>
                                <Nav.Item  href="https://github.com/rsuite/rsuite-table">GitHub</Nav.Item>
                            </Nav>
                        </Navbar.Collapse>
                    </div>
                </Header>

                <div className="container">

                    <Markdown>{require('../README.md')}</Markdown>


                    <h2 id="examples"># 示例</h2>
                    <h3>固定表头,固定前两列 </h3>
                    <FixedColumnTable />
                    <Markdown>{require('./md/FixedColumnTable.md')}</Markdown>
                    <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/FixedColumnTable.js" target="_blank" >示例代码</a></p>
                    <hr/>

                    <h3>自定义调整列宽 </h3>
                    <ResizableColumnTable />
                    <Markdown>{require('./md/ResizableColumnTable.md')}</Markdown>
                    <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/ResizableColumnTable.js" target="_blank" >示例代码</a></p>
                    <hr/>

                    <h3>自定义单元格 </h3>
                    <CustomColumnTable />
                    <Markdown>{require('./md/CustomColumnTable.md')}</Markdown>
                    <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/CustomColumnTable.js" target="_blank" >示例代码</a></p>
                    <hr/>

                    <h3>分页 </h3>
                    <PaginationTable />
                    <Markdown>{require('./md/PaginationTable.md')}</Markdown>
                    <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/PaginationTable.js" target="_blank" >示例代码</a></p>
                    <hr/>

                    <h3>树形表格</h3>
                    <TreeTable/>
                    <Markdown>{require('./md/TreeTable.md')}</Markdown>
                    <p><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/TreeTable.js" target="_blank" >示例代码</a></p>

                    <h3 id="api"># API </h3>
                    <Markdown>
                        {
                            require('./md/props.md')
                        }
                    </Markdown>
                </div>

            </div>

        );
    }
});

ReactDOM.render(<App/>,
    document.getElementById('app')
);
