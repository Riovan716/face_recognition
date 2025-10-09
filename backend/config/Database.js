import { Sequelize } from "sequelize";

const db = new Sequelize("presensi_app", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
