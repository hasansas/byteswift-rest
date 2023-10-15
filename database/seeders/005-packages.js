'use strict'

import path from 'path'

const { v4: uuidv4 } = require('uuid')

export async function up (queryInterface, Sequelize) {
  const _packages = [
    {
      id: uuidv4(),
      name: 'Free Trial',
      description: 'Free Trial',
      content: '',
      price: 0,
      quota: 100,
      duration: 30,
      publish: false,
      is_trial: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
  await queryInterface.bulkInsert('packages', _packages, {
    returning: true
  })

  // log seeder
  const seeder = path.basename(__filename)
  await queryInterface.bulkInsert('SequalizeSeeders', [{ name: seeder }], {})
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('packages', null, {})
}
