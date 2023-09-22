'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('users_verification', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      field: 'user_id',
      allowNull: false
    },
    verificationType: {
      type: Sequelize.STRING,
      field: 'verification_type'
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false
    },
    expiredAt: {
      type: Sequelize.DATE,
      field: 'expired_at',
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      allowNull: false
    }
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.dropTable('users_verification')
}
