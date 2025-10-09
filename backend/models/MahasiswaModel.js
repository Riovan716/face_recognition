import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Mahasiswa = db.define(
  "mahasiswa",
  {
    nim: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    jurusan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ipk: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tempatTinggal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    faceImagePath: {
      type: DataTypes.STRING,
      allowNull: true, // Boleh null jika belum upload foto
    },
    deskriptorWajah: {
      type: DataTypes.JSON, // Simpan array 128 angka
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Mahasiswa;
