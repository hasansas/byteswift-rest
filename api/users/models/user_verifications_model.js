/**
 * User Verivications Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const UsersInfo = sequelize.define(
    'userVerifications',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      verificationType: {
        type: DataTypes.STRING
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expiredAt: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'users_verification',
      freezeTableName: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      },
      scopes: {
        // ..
      }
    }
  )
  UsersInfo.associate = function (models) {
    // associations can be defined here
  }
  return UsersInfo
}
