/**
 * User Roles Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const usersRoles = sequelize.define(
    'usersRoles',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      roleId: {
        type: DataTypes.UUID,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      }
    },
    {
      tableName: 'users_roles',
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
      },
      scopes: {
        // ..
      }
    }
  )
  usersRoles.associate = function (models) {
    // associations can be defined here
  }
  return usersRoles
}
