// eslint-disable-next-line @typescript-eslint/no-var-requires
const faker = require('faker');

export function createFakeRowObjectData(index) {
  return {
    id: index,
    avartar: faker.image.avatar(),
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    suffix: faker.name.suffix(),
    date: faker.date.past(),
    bs: faker.company.bs(),
    catchPhrase: faker.company.catchPhrase(),
    companyName: faker.company.companyName(),
    words: faker.lorem.words(),
    sentence: faker.lorem.sentence(),
    address: {
      city: faker.address.city(),
      street: faker.address.streetName(),
      zipCode: faker.address.zipCode()
    }
  };
}

export default function fakeObjectDataListStore(size) {
  const dataList = [];
  for (let i = 0; i < size; i++) {
    dataList.push(createFakeRowObjectData(i + 1));
  }
  return dataList;
}
