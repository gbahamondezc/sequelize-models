module.exports = {

  up: async queryInterface => {

    await queryInterface.bulkInsert('profile', [{
      name: 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'Guest',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'Technician',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('department', [{
      name: 'Administration',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'Suport',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'RRHH',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('user', [{
      firstName: 'Gonzalo',
      lastName: 'The Bear',
      bornDate: new Date('06-11-1990'),
      profileId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      firstName: 'Nat',
      lastName: 'The Fox',
      bornDate: new Date('12-12-1989'),
      profileId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      firstName: 'Anastasia',
      lastName: 'The Chinchilla',
      bornDate: new Date('01-11-2016'),
      profileId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      firstName: 'Smaug',
      lastName: 'The Cat',
      bornDate: new Date('03-01-2016'),
      profileId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      firstName: 'Sauron',
      lastName: 'The Cat',
      bornDate: new Date('11-01-2016'),
      profileId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    return queryInterface.bulkInsert('user_department', [{
      departmentId: 1,
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      departmentId: 2,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      departmentId: 2,
      userId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      departmentId: 3,
      userId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

  }
};
