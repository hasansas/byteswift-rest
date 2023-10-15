/**
 * Mail
 */

'use strict'

import nodemailer from 'nodemailer'
import handlebars from 'handlebars'

export const sendMail = async function (mailTo, mailTemplate, mailData) {
  const emailTemplateModel = DB.emailTemplates
  const _mailTemplate = await emailTemplateModel.findOne({ where: { name: mailTemplate } })

  if (_mailTemplate != null) {
    const _config = {
      host: ENV.MAIL_HOST,
      port: ENV.MAIL_PORT,
      auth: {
        user: ENV.MAIL_USERNAME,
        pass: ENV.MAIL_PASSWORD
      }
    }

    try {
      // create transporter
      const transporter = nodemailer.createTransport(_config)

      // mail options
      const renderContentText = handlebars.compile(_mailTemplate.contentText)
      const contentText = renderContentText(mailData)
      const renderContentHtml = handlebars.compile(_mailTemplate.contentHtml)
      const contentHtml = renderContentHtml(mailData)

      const mailOptions = {
        from: `"${_mailTemplate.fromName}" <${_mailTemplate.from}>`,
        to: mailTo,
        subject: _mailTemplate.subject,
        text: contentText,
        html: contentHtml
      }
      const sendMail = await transporter.sendMail(mailOptions)
      console.log('Message sent: %s', sendMail.messageId)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }
}

const mail = {
  send: sendMail
}

export default mail
