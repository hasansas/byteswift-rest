'use strict'

export async function up (queryInterface, Sequelize) {
  await queryInterface.createTable('SequalizeSeeders', {
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    }
  })
}
export async function down (queryInterface, Sequelize) {
  await queryInterface.dropTable('SequalizeSeeders')
}
