'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('email_templates', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING
    },
    subject: {
      type: Sequelize.STRING
    },
    cc: {
      type: Sequelize.STRING
    },
    bcc: {
      type: Sequelize.STRING
    },
    from: {
      type: Sequelize.STRING
    },
    fromName: {
      type: Sequelize.STRING,
      field: 'from_name'
    },
    contentHtml: {
      type: Sequelize.TEXT,
      field: 'content_html'
    },
    contentText: {
      type: Sequelize.TEXT,
      field: 'content_text'
    },
    contentCode: {
      type: Sequelize.JSON,
      field: 'content_code'
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false
    },
    createdBy: {
      type: Sequelize.UUID,
      field: 'created_by',
      references: { model: 'users', key: 'id' }
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      allowNull: false
    },
    updatedBy: {
      type: Sequelize.UUID,
      field: 'updated_by',
      references: { model: 'users', key: 'id' }
    },
    deletedAt: {
      type: Sequelize.DATE,
      field: 'deleted_at'
    },
    deletedBy: {
      type: Sequelize.UUID,
      field: 'deleted_by',
      references: { model: 'users', key: 'id' }
    }
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.dropTable('email_templates')
}
