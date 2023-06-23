const Model = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
    }
  };
  Menu.init({
    title: DataTypes.STRING,
    price: DataTypes.INTEGER,
    url: DataTypes.TEXT,
    order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Menu',
  });
  return Menu;
};