/**
 * Webhooks Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const Webhooks = sequelize.define(
    'webhooks',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        field: 'user_id',
        references: { model: 'users', key: 'id' }
      },
      event: {
        type: DataTypes.STRING
      },
      request: {
        type: DataTypes.JSON
      }
    },
    {
      tableName: 'webhooks',
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['updatedAt', 'deletedAt'] }
      },
      scopes: {
        // ..
      }
    }
  )

  return Webhooks
}
