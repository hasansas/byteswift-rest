'use strict'

import path from 'path'

const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')

export async function up (queryInterface, Sequelize) {
  // Get roles
  const _roles = []

  _roles.developer = { id: '', name: 'developer' }
  _roles.superAdmin = { id: '', name: 'superadmin' }
  _roles.admin = { id: '', name: 'admin' }

  _roles.developer.id = await getRoleId(queryInterface, _roles.developer.name)
  _roles.superAdmin.id = await getRoleId(queryInterface, _roles.superAdmin.name)
  _roles.admin.id = await getRoleId(queryInterface, _roles.admin.name)

  // Create user
  const _salt = await bcrypt.genSalt(10)
  const _initialPassword = 'mySecr3tPass'
  const _users = [
    {
      id: uuidv4(),
      name: 'Developer',
      email: 'developer@dev.edumo.com',
      password: await bcrypt.hash(_initialPassword, _salt),
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Super Admin',
      email: 'superadmin@dev.edumo.com',
      password: await bcrypt.hash(_initialPassword, _salt),
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@dev.edumo.com',
      password: await bcrypt.hash(_initialPassword, _salt),
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
  await queryInterface.bulkInsert('users', _users, {
    returning: true
  }).then(async (users) => {
    const _userRoles = [
      {
        user_id: users[0].id,
        role_id: _roles.developer.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: users[1].id,
        role_id: _roles.superAdmin.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: users[2].id,
        role_id: _roles.admin.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
    await queryInterface.bulkInsert('users_roles', _userRoles, {})

    // log seeder
    const seeder = path.basename(__filename)
    await queryInterface.bulkInsert('SequalizeSeeders', [{ name: seeder }], {})
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('users', null, {})
}

async function getRoleId (queryInterface, roleId) {
  try {
    const _developerRole = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name='" + roleId + "' limit 1")
    roleId = _developerRole[0][0].id
    return roleId
  } catch (error) {
    console.log(error)
  }
}
