module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverers', 'removed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliverers', 'removed_at');
  },
};
