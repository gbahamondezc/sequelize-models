module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Profile table
    await queryInterface.createTable('profile', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // Department table
    await queryInterface.createTable('department', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // User table
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      bornDate: Sequelize.DATE,
      profileId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'profile',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      enumField : Sequelize.ENUM('value', 'another value'),
      // rangeField: Sequelize.RANGE,
      charField: Sequelize.CHAR,
      textField: Sequelize.TEXT,
      bigintField: Sequelize.BIGINT,
      floatField: Sequelize.FLOAT,
      doubleField: Sequelize.DOUBLE,
      decimalField: Sequelize.DECIMAL,
      realField: Sequelize.REAL,
      booleanField: Sequelize.BOOLEAN,
      blobField: Sequelize.BLOB,
      dateonlyField: Sequelize.DATEONLY,
      timeField: Sequelize.TIME,
      uuidField: Sequelize.UUID,
      // jsonField: Sequelize.JSON,
      // jsonbField: Sequelize.JSONB,
      // arrayField: Sequelize.ARRAY(Sequelize.INTEGER),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // User Department relation table
    return queryInterface.createTable('user_department', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      departmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'department',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  down: async (queryInterface) => {
    // Drop all tables
    return queryInterface.dropAllTables();
  }
};
