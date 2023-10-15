'use strict'

import path from 'path'

const fs = require('fs')

export async function up (queryInterface, Sequelize) {
  const { MAIL_FROM, MAIL_FROM_NAME } = process.env
  const seederDataPath = path.join(__dirname, '../data/email/')

  fs.readdir(seederDataPath, async (error, files) => {
    if (error) return console.log(error)

    const item = {
      register: {
        subject: 'Verify your registration',
        description: 'Email registration'
      },
      register_success: {
        subject: 'Register Success',
        description: 'Email registration success'
      },
      order: {
        subject: 'Order success',
        description: 'Email order success'
      },
      forgot_password: {
        subject: 'Forgot Password',
        description: 'Email forgot password'
      },
      reset_password: {
        subject: 'Reset Password',
        description: 'Email reset password'
      }
    }

    const templates = []
    files.forEach(templateName => {
      if (item[templateName]) {
        const _templates = {
          name: templateName,
          subject: item[templateName].subject,
          description: item[templateName].description,
          from: MAIL_FROM,
          from_name: MAIL_FROM_NAME,
          content_html: getStringContent(templateName, 'html'),
          content_text: getStringContent(templateName, 'txt'),
          content_code: getStringContent(templateName, 'json'),
          created_at: new Date(),
          updated_at: new Date()
        }
        templates.push(_templates)
      }
    })

    await queryInterface.bulkInsert('email_templates', templates, {
      returning: true
    })

    // log seeder
    const seeder = path.basename(__filename)
    await queryInterface.bulkInsert('SequalizeSeeders', [{ name: seeder }], {})
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
