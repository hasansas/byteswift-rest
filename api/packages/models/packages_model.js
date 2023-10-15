/**
 * Packages Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const Packages = sequelize.define(
    'packages',
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
      },
      content: {
        type: DataTypes.TEXT
      },
      price: {
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
      publish: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      isTrial: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
      tableName: 'packages',
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['isTrial', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'deletedAt', 'deletedBy'] }
      }
    }
  )
  Packages.associate = function (models) {
    // associations can be defined here
  }
  return Packages
}
