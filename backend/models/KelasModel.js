import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Kelas = db.define(
  "Kelas",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    matakuliahUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    materi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    waktuMulai: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    waktuSelesai: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Kelas;
