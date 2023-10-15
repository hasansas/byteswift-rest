'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('packages', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.TEXT
    },
    price: {
      type: Sequelize.INTEGER
    },
    quota: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    publish: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    position: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    isTrial: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_trial'
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false
    },
    createdBy: {
      type: Sequelize.UUID,
      field: 'created_by',
      references: { model: 'users', key: 'id' }
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      allowNull: false
    },
    updatedBy: {
      type: Sequelize.UUID,
      field: 'updated_by',
      references: { model: 'users', key: 'id' }
    },
    deletedAt: {
      type: Sequelize.DATE,
      field: 'deleted_at'
    },
    deletedBy: {
      type: Sequelize.UUID,
      field: 'deleted_by',
      references: { model: 'users', key: 'id' }
    }
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.dropTable('packages')
}
