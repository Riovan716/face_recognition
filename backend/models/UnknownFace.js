import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const UnknownFace = db.define(
  "unknownface",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    photo: {
      type: DataTypes.TEXT, // base64 atau path file
      allowNull: false,
    },
    descriptor: {
      type: DataTypes.TEXT, // simpan JSON.stringify(descriptor)
      allowNull: false,
    },
    waktu: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default UnknownFace;
