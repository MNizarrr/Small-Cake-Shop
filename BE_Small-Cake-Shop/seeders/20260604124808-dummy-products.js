'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const dummyProducts = [];

    for (let i = 1; i <= 15; i++) {
      dummyProducts.push({
        name: `Produk ke-${i}`,
        description: `Deskripsi produk ke-${i}`,
        price: Math.floor(Math.random() * 100000) + 10000,
        stock: Math.floor(Math.random() * 50) + 1,
        image : null,
        is_active: true,
        createdAt: new Date(),
        updatedAt : new Date()
      });
    }

    await queryInterface.bulkInsert('Products', dummyProducts);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
