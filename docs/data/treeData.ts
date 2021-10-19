import _ from 'lodash';
export const baseData = [
  {
    key: '9-2-1-1',
    labelName: '运动型两厢轿车',
    status: 'DISABLED',
    count: 502
  },
  {
    key: '10-2-1-2',
    labelName: '双门轿跑车',
    status: 'ENABLED',
    count: 502
  },
  {
    key: '11-2-1-3',
    labelName: '敞篷跑车',
    status: 'DISABLED'
  },
  {
    key: '4-2-1-1',
    labelName: '运动型两厢轿车',
    status: 'DISABLED',
    count: 502
  },
  {
    key: '5-2-1-2',
    labelName: '双门轿跑车',
    status: 'ENABLED',
    count: 502
  },
  {
    key: '6-2-1-3',
    labelName: '敞篷跑车',
    status: 'DISABLED'
  },
  {
    key: '12-2-1-4',
    labelName: '多功能旅行车',
    status: 'DISABLED'
  },
  {
    key: '13-2-1-5',
    labelName: '旅行车',
    status: 'DISABLED',
    count: 34
  },
  {
    key: '9-2-1-1-2-3-3-3',
    labelName: '运动型两厢轿车',
    status: 'DISABLED',
    count: 502
  },
  {
    key: '10-2-1-2-2-4-4-4',
    labelName: '双门轿跑车',
    status: 'ENABLED',
    count: 502
  },
  {
    key: '7-2-1-4',
    labelName: '多功能旅行车',
    status: 'DISABLED'
  },
  {
    key: '17-2-1-4',
    labelName: '多功能旅行车',
    status: 'DISABLED'
  },
  {
    key: '11-2-1-3-2-5-5-5',
    labelName: '敞篷跑车',
    status: 'DISABLED'
  },
  {
    key: 0,
    labelName: '汽车',
    status: 'DISABLED',
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
      },
      {
        key: '3-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '4-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '5-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '6-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '7-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '8-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '9-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '10-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '11-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '12-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '13-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '14-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '15-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '16-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '17-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '18-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '19-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '20-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '21-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '22-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '23-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '24-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '25-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '26-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '27-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '28-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '29-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '30-2',
        labelName: '手机游戏',
        status: 'ENABLED'
      },
      {
        key: '31-1',
        labelName: '网络游戏',
        status: 'DISABLED'
      },
      {
        key: '32-2',
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

const largerData = _.cloneDeep(baseData);

largerData[13].children = Array.from({ length: 1000 }, (v, k) => {
  return {
    key: `10-2-1-2-1-${k}`,
    labelName: '双门轿跑车',
    status: 'ENABLED',
    count: 502
  };
});

largerData[14].children = Array.from({ length: 1000 }, (v, k) => {
  return {
    key: `10-2-1-2-2-${k}`,
    labelName: '双门轿跑车',
    status: 'ENABLED',
    count: 502
  };
});

largerData[15].children = Array.from({ length: 1000 }, (v, k) => {
  return {
    key: `10-2-1-2-3-${k}`,
    labelName: '双门轿跑车',
    status: 'ENABLED',
    count: 502
  };
});

export default largerData;
