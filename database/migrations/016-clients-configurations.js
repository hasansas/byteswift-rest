'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('clients_configurations', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    clientId: {
      type: Sequelize.UUID,
      references: { model: 'clients', key: 'id' },
      onDelete: 'CASCADE',
      field: 'client_id',
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false
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
  await queryInterface.dropTable('clients_configurations')
}
