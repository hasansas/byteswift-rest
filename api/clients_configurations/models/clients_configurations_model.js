/**
 * Clients Configurations Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const ClientsConfigurations = sequelize.define(
    'clientsConfigurations',
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'clients_configurations',
      freezeTableName: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      },
      scopes: {
        // ..
      }
    }
  )
  ClientsConfigurations.associate = function (models) {
    ClientsConfigurations.belongsTo(models.clients, {
      foreignKey: 'client_id'
    })
  }
  return ClientsConfigurations
}
