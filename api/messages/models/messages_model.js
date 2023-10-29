/**
 * Message Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define(
    'messages',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' }
      },
      templateId: {
        type: DataTypes.STRING
      },
      event: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      error: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'messages',
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
  Messages.associate = function (models) {
    // associations can be defined here
  }
  return Messages
}
