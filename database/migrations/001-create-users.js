'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
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
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    phoneNumber: {
      type: Sequelize.STRING,
      field: 'phone_number'
    },
    password: {
      type: Sequelize.STRING
    },
    firstLogin: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      field: 'first_login'
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    isEmailVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_email_verified'
    },
    isPhoneVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_phone_verified'
    },
    image: {
      type: Sequelize.STRING
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
  await queryInterface.dropTable('users')
}
