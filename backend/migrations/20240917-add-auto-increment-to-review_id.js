'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add AUTO_INCREMENT to review_id column in reviews_given table
    await queryInterface.sequelize.query(`
      ALTER TABLE reviews_given
      MODIFY COLUMN review_id INT AUTO_INCREMENT;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove AUTO_INCREMENT from review_id column
    await queryInterface.sequelize.query(`
      ALTER TABLE reviews_given
      MODIFY COLUMN review_id INT NOT NULL;
    `);
  }
};
