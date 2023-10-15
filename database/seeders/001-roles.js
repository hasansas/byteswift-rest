'use strict'

import path from 'path'

const { v4: uuidv4 } = require('uuid')

export async function up (queryInterface, Sequelize) {
  const _roles = [
    {
      id: uuidv4(),
      name: 'developer',
      description: 'A Developer User',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'superadmin',
      description: 'A Super Admin User',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'admin',
      description: 'An Admin User',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'client',
      description: 'A Client User',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]

  await queryInterface.bulkInsert('roles', _roles, {})

  // log seeder
  const seeder = path.basename(__filename)
  await queryInterface.bulkInsert('SequalizeSeeders', [{ name: seeder }], {})
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('roles', null, {})
}
