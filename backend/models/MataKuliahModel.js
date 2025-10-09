import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const MataKuliah = db.define(
  "matakuliah",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },

    matakuliah: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    kodematakuliah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    semester: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    sks: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    tahunajaran: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

export default MataKuliah;
