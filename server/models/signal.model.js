import {DataTypes} from "sequelize";

export function createModel(database) {
  database.define('Signal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: false
    }, 
    latitude: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: false
    }, 
    longitude: {
      type: DataTypes.DECIMAL(9,6),
      allowNull: false
    }
  });
}