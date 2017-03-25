
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
                            <Nav pullRight>
                                <Nav.Item  href="https://github.com/rsuite/rsuite-table">GitHub</Nav.Item>
                            </Nav>
                        </Navbar.Collapse>
                    </div>
                </Header>

                <div className="container">

                    <h2>锁定表头 </h2>
                    <FixedColumnTable />
                   
                    <h4><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/FixedColumnTable.js" target="_blank" >示例代码</a></h4>
                    <hr/>

                    <h2>自定义调整列宽 </h2>
                    <ResizableColumnTable />
                    <h4><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/ResizableColumnTable.js" target="_blank" >示例代码</a></h4>
                    <hr/>

                    <h2>自定义单元格 </h2>
                    <CustomColumnTable />
                    <h4><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/CustomColumnTable.js" target="_blank" >示例代码</a></h4>
                    <hr/>

                    <h2>分页 </h2>
                    <PaginationTable />
                    <h4><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/PaginationTable.js" target="_blank" >示例代码</a></h4>
                    <hr/>

                    <h2>树形表格</h2>
                    <TreeTable/>
                    <h4><a href="https://github.com/rsuite/rsuite-table/tree/master/docs/examples/TreeTable.js" target="_blank" >示例代码</a></h4>

                    <h2>API </h2>
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
