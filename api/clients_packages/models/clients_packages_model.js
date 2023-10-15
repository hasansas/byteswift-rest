/**
 * Clients Packages Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const ClientsPackages = sequelize.define(
    'clientsPackages',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      clientId: {
        type: DataTypes.UUID,
        references: { model: 'clients', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      packageId: {
        type: DataTypes.UUID,
        references: { model: 'packages', key: 'id' },
        allowNull: false
      },
      packageName: {
        type: DataTypes.STRING
      },
      packageQuota: {
        type: DataTypes.INTEGER
      },
      quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      expiredAt: {
        type: DataTypes.STRING,
        allowNull: false
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
      tableName: 'clients_packages',
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
