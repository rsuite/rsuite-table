
const faker = require('faker');

function createFakeRowObjectData(index) {
    return {
        id: index,
        avartar: faker.image.avatar(),
        city: faker.address.city(),
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        street: faker.address.streetName(),
        zipCode: faker.address.zipCode(),
        date: faker.date.past(),
        bs: faker.company.bs(),
        catchPhrase: faker.company.catchPhrase(),
        companyName: faker.company.companyName(),
        words: faker.lorem.words(),
        sentence: faker.lorem.sentence(),
    };
}

module.exports = function fakeObjectDataListStore(size) {
    var dataList = [];
    for (var i = 0; i < size; i++) {
        dataList.push(createFakeRowObjectData(i + 1));
    }
    return dataList;
};

