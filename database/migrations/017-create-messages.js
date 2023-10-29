'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('messages', {
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
    templateId: {
      type: Sequelize.STRING,
      field: 'template_id'
    },
    event: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.STRING
    },
    error: {
      type: Sequelize.STRING
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
  await queryInterface.dropTable('messages')
}
