/**
 * Token Uses Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const ClientsPackages = sequelize.define(
    'tokenUses',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      clientPackageId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      event: {
        type: DataTypes.STRING
      },
      createdBy: {
        type: DataTypes.UUID
      },
      updatedBy: {
        type: DataTypes.UUID
      },
      deletedBy: {
        type: DataTypes.UUID
      }
    },
    {
      tableName: 'token_uses',
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['createdBy', 'updatedAt', 'updatedBy', 'deletedAt', 'deletedBy'] }
      }
    }
  )
  ClientsPackages.associate = function (models) {
    // associations can be defined here
  }
  return ClientsPackages
}
