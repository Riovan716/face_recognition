import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const PresensiGlobal = db.define(
  "presensiglobal",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    nim: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    waktu: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false, // contoh: "hadir", "terdeteksi"
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: true, // opsional jika ingin menyimpan path foto saat absensi
    },
  },
  {
    freezeTableName: true,
    timestamps: false, // nonaktifkan createdAt & updatedAt jika tidak diperlukan
  }
);

export default PresensiGlobal;
