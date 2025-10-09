import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Dosen = db.define(
  "dosen",
  {
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    jurusan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Dosen;
