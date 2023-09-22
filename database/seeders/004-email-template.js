'use strict'

const fs = require('fs')
const path = require('path')

export async function up (queryInterface, Sequelize) {
  const { MAIL_FROM, MAIL_FROM_NAME } = process.env
  const templates = [
    {
      name: 'register',
      subject: 'Register Success',
      description: 'Email user registration',
      from: MAIL_FROM,
      from_name: MAIL_FROM_NAME,
      content_html: getStringContent('register', 'html'),
      content_text: getStringContent('register', 'txt'),
      content_code: getStringContent('register', 'json'),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'register_success',
      subject: 'Register Success',
      description: 'Email user registration using auth providers',
      from: MAIL_FROM,
      from_name: MAIL_FROM_NAME,
      content_html: getStringContent('register_success', 'html'),
      content_text: getStringContent('register_success', 'txt'),
      content_code: getStringContent('register_success', 'json'),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]

  await queryInterface.bulkInsert('email_templates', templates, {
    returning: true
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('email_templates', null, {})
}

function getStringContent (templateName, ext) {
  const filaPath = path.join(__dirname, `../data/email/${templateName}/content.${ext}`)
  const stringCOntent = fs.readFileSync(filaPath, 'utf8')
  return stringCOntent
}
