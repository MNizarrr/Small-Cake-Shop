"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("adm567890", 10);

    await queryInterface.bulkInsert("Users", [
      {
        name: "Admin001",
        email: "admin01@happy.com",
        password: password,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", { role: "admin" });
  },
};
