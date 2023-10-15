'use strict'

import path from 'path'

export async function up (queryInterface, Sequelize) {
  const _settings = [
    {
      name: 'app_name',
      value: 'Bytexist',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'site_title',
      value: 'Bytexist',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'site_title_show',
      value: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'site_description',
      value: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'site_tags',
      value: 'Sed ut, perspiciatis, unde, omnis, iste, natus',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'site_logo',
      value: '',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'company_name',
      value: 'Bytexist',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'company_phone',
      value: '+62 123456789',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'company_email',
      value: 'mycompany@domain.com',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'company_address',
      value: '221B Baker St, Marylebone, London NW1 6XE, UK,',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'company_location',
      value: '-7.795580,110.369492',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'theme',
      value: 'Bytexist',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'theme_color',
      value: 'default',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
  await queryInterface.bulkInsert('settings', _settings, {
    returning: true
  })

  // log seeder
  const seeder = path.basename(__filename)
  await queryInterface.bulkInsert('SequalizeSeeders', [{ name: seeder }], {})
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('settings', null, {})
}
