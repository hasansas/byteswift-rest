/**
 * Clients Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const Clients = sequelize.define(
    'clients',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      serverKey: {
        type: DataTypes.STRING,
        unique: true
      },
      clientKey: {
        type: DataTypes.STRING,
        unique: true
      }
    },
    {
      tableName: 'clients',
      freezeTableName: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
      },
      scopes: {
        // ..
      }
    }
  )
  Clients.associate = function (models) {
    Clients.hasMany(models.clientsConfigurations, {
      foreignKey: 'client_id'
    })
  }
  return Clients
}
