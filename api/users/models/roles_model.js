/**
 * Roles Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define(
    'roles',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'roles',
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
  Roles.associate = function (models) {
    // associations can be defined here
  }
  return Roles
}
