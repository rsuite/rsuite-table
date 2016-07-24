import React from 'react';
import {Table, Column, Cell, HeaderCell } from '../../src';


function fakeObjectDataListStore() {
    return [
        {
            labelName: '汽车',
            status: 'ENABLED',
            children: [
                {
                    labelName: '梅赛德斯-奔驰',
                    status: 'ENABLED',
                    count: 460
                },
                {
                    labelName: 'BMW',
                    status: 'ENABLED',
                    children: [
                        {
                            labelName: '2系',
                            status: 'ENABLED',
                            count: 103,
                            children: [
                                {
                                    labelName: '运动型两厢轿车',
                                    status: 'DISABLED',
                                    count: 502,
                                },
                                {
                                    labelName: '双门轿跑车',
                                    status: 'ENABLED',
                                    count: 502,
                                },
                                {
                                    labelName: '敞篷跑车',
                                    status: 'DISABLED',
                                },
                                {
                                    labelName: '多功能旅行车',
                                    status: 'DISABLED',
                                },
                                {
                                    labelName: '旅行车',
                                    status: 'DISABLED',
                                    count: 34,
                                }
                            ]
                        },
                        {
                            labelName: '意向客户',
                            status: 'ENABLED',
                            count: 364,
                            children: [
                                {
                                    labelName: '金融方案',
                                    status: 'DISABLED',
                                },
                                {
                                    labelName: '预约试驾',
                                    status: 'ENABLED',
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            labelName: '游戏',
            status: 'ENABLED',
            count: 834,
            children: [{
                labelName: '网络游戏',
                status: 'DISABLED',
            }, {
                    labelName: '手机游戏',
                    status: 'ENABLED',
                }]
        },
        {
            labelName: '数码',
            status: 'ENABLED',
            count: 534,
            children: [{
                labelName: '手机',
                status: 'ENABLED',
            }, {
                    labelName: '电脑',
                    status: 'DISABLED',
                }, {
                    labelName: '手表',
                    status: 'ENABLED',
                }]
        }

    ];
}

export const StatesCell = ({ rowData, dataKey, ...props }) => {
    let clesses = 'icon icon-big ' + (rowData[dataKey] === 'ENABLED' ? 'icon-ok-circle green' : 'icon-info gray');
    return (
        <Cell {...props}>
            <i className={clesses}></i>
        </Cell>
    );
};

const TreeTable = React.createClass({
    getInitialState() {
        return {
            data: fakeObjectDataListStore(100)
        };
    },
    render() {
        const {data} = this.state;
        return (
            <div>
                <Table  height={400} data={data} isTree expand>

                    <Column width={300} >
                        <HeaderCell>Label</HeaderCell>
                        <Cell dataKey="labelName" />
                    </Column>

                    <Column width={100} >
                        <HeaderCell>States</HeaderCell>
                        <StatesCell dataKey="status" />
                    </Column>

                    <Column width={100} >
                        <HeaderCell>Count</HeaderCell>
                        <Cell dataKey="count" />
                    </Column>

                </Table>
            </div>
        );
    }
});

export default TreeTable;
