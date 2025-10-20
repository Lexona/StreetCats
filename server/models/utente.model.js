import DataTypes from "sequelize";
import { createHash } from "crypto";

export function createModel(database){
  database.define('Utente', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }, 
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        let hash = createHash("sha256");
        this.setDataValue('password', hash.update(value).digest("hex"));
      }
    }
  });
}