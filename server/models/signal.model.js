import {DataTypes} from "sequelize";

export function createModel(database) {
  database.define('Signal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.TEXT
    },
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: false
    }, 
    latitudine: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: false
    }, 
    longitudine: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: false
    }
  });
}