'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('users_roles', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      field: 'user_id',
      allowNull: false
    },
    roleId: {
      type: Sequelize.UUID,
      references: { model: 'roles', key: 'id' },
      field: 'role_id',
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
  await queryInterface.dropTable('users_roles')
}
