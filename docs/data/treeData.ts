const faker = require('faker');

export const baseData = [
  {
    key: 0,
    name: 'dog',
    status: 'DISABLED',
    children: []
  },
  {
    key: 1,
    name: 'cat',
    status: 'ENABLED',
    count: 834,
    children: []
  },
  {
    key: 2,
    name: 'snake',
    status: 'ENABLED',
    count: 534,
    children: []
  }
];

baseData.forEach(item => {
  item.children = Array.from({ length: 10 }, (v, k) => {
    return {
      key: `${item.key}-${k}`,
      name: faker.animal?.[item.name]?.(),
      status: faker.datatype?.boolean() ? 'ENABLED' : 'DISABLED',
      count: faker.datatype?.number(),
      country: faker.address?.country()
    };
  });
});

export default baseData;
