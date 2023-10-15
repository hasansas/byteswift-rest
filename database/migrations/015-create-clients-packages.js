'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('clients_packages', {
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
    packageId: {
      type: Sequelize.UUID,
      references: { model: 'packages', key: 'id' },
      field: 'package_id',
      allowNull: false
    },
    packageName: {
      type: Sequelize.STRING,
      field: 'package_name'
    },
    packageQuota: {
      type: Sequelize.INTEGER,
      field: 'package_quota'
    },
    quota: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    duration: {
      type: Sequelize.INTEGER,
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
    createdBy: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      field: 'created_by'
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
  await queryInterface.dropTable('clients_packages')
}
