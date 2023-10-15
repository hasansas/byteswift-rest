/**
 * Email Templates Model
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define(
    'emailTemplates',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING
      },
      subject: {
        type: DataTypes.STRING
      },
      cc: {
        type: DataTypes.STRING
      },
      bcc: {
        type: DataTypes.STRING
      },
      from: {
        type: DataTypes.STRING
      },
      fromName: {
        type: DataTypes.STRING
      },
      contentHtml: {
        type: DataTypes.TEXT
      },
      contentText: {
        type: DataTypes.TEXT
      },
      contentCode: {
        type: DataTypes.JSON
      }
    },
    {
      tableName: 'email_templates',
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
      },
      scopes: {
        // ...
      }
    }
  )
  EmailTemplate.associate = function (models) {
    // ...
  }
  return EmailTemplate
}
