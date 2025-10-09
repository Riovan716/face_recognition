import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Presensi = db.define(
  "presensi",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    kelasUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    waktu: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false, // contoh: "hadir", "terlambat", "alpa"
    },
  },
  {
    freezeTableName: true,
  }
);

export default Presensi;
