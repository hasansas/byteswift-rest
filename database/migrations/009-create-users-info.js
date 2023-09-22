'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('users_info', {
    userId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      field: 'user_id',
      allowNull: false
    },
    dateOfBirth: {
      type: Sequelize.STRING,
      field: 'date_of_birth'
    },
    placeOfBirth: {
      type: Sequelize.STRING,
      field: 'place_of_birth'
    },
    gender: {
      type: Sequelize.ENUM,
      values: ['male', 'female']
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
    }
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.dropTable('users_info')
}
