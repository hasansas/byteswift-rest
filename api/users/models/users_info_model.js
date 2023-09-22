/**
 * User Info Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const UsersInfo = sequelize.define(
    'usersInfo',
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
        allowNull: false
      },
      dateOfBirth: {
        type: DataTypes.STRING
      },
      placeOfBirth: {
        type: DataTypes.STRING
      },
      gender: {
        type: DataTypes.ENUM,
        values: ['male', 'female']
      }
    },
    {
      tableName: 'users_info',
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
