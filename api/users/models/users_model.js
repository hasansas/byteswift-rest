/**
 * Users Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      image: {
        type: DataTypes.STRING
      },
      firstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'users',
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] }
      },
      scopes: {
        // ..
      }
    }
  )
  Users.associate = function (models) {
    Users.belongsToMany(models.roles, {
      hooks: true,
      through: 'usersRoles',
      foreignKey: 'user_id'
    })
    Users.hasOne(models.usersInfo, {
      foreignKey: 'user_id',
      required: false
    })
  }
  return Users
}
