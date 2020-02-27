export default [
  {
    key: 0,
    labelName: '汽车',
    status: 'ENABLED',
    children: [
      {
        key: '1-1',
        labelName: '梅赛德斯-奔驰',
        status: 'ENABLED',
        count: 460
      },
      {
        key: '1-2',
        labelName: 'BMW',
        status: 'ENABLED',
        children: [
          {
            key: '1-2-1',
            labelName: '2系',
            status: 'ENABLED',
            count: 103,
            children: [
              {
                key: '1-2-1-1',
                labelName: '运动型两厢轿车',
                status: 'DISABLED',
                count: 502
              },
              {
                key: '1-2-1-2',
                labelName: '双门轿跑车',
                status: 'ENABLED',
                count: 502
              },
              {
                key: '1-2-1-3',
                labelName: '敞篷跑车',
                status: 'DISABLED'
              },
              {
                key: '1-2-1-4',
                labelName: '多功能旅行车',
                status: 'DISABLED'
              },
              {
                key: '1-2-1-5',
                labelName: '旅行车',
                status: 'DISABLED',
                count: 34
              }
            ]
          },
          {
            key: '1-2-2',
            labelName: '意向客户',
            status: 'ENABLED',
            count: 364,
            children: [
              {
                key: '1-2-2-1',
                labelName: '金融方案',
                status: 'DISABLED'
              },
              {
                key: '1-2-2-2',
                labelName: '预约试驾',
                status: 'ENABLED'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: '2',
    labelName: '游戏',
    status: 'ENABLED',
    count: 834,
    children: [
      {
        key: '2-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '2-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      }
    ]
  },
  {
    key: '3',
    labelName: '数码',
    status: 'ENABLED',
    count: 534,
    children: [
      {
        key: '3-1',
        labelName: '手机',
        status: 'ENABLED',
        children: []
      },
      {
        key: '3-2',
        labelName: '电脑',
        status: 'DISABLED'
      },
      {
        key: '3-3',
        labelName: '手表',
        status: 'ENABLED'
      }
    ]
  }
];
