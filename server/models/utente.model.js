import DataTypes from "sequelize";

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
        let hash = createHash("6e6bc4e49dd477ebc98ef4046c067b5f");
        this.setDataValue('password', hash.update(value).digest("hex"));
      }
    }
  });
}