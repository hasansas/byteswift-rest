'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('webhooks', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      field: 'user_id',
      references: { model: 'users', key: 'id' }
    },
    event: {
      type: Sequelize.STRING
    },
    request: {
      type: Sequelize.JSON
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
    },
    deletedAt: {
      type: Sequelize.DATE,
      field: 'deleted_at'
    }
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.dropTable('clients_notifications')
}
