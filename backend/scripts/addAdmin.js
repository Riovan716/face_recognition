// Script untuk menambahkan akun admin dengan password Argon2
import db from "../config/Database.js";
import Users from "../models/UserModel.js";
import argon2 from "argon2";

const addAdminAccount = async () => {
  try {
    console.log("🔄 Memulai proses menambahkan akun admin...");
    
    // Test koneksi database
    console.log("🔌 Mencoba koneksi ke database...");
    await db.authenticate();
    console.log("✅ Koneksi database berhasil");

    // Sync model dengan database
    console.log("🔄 Sinkronisasi model dengan database...");
    await db.sync({ force: false });
    console.log("✅ Model berhasil di-sync");

    // Password yang akan di-hash
    const plainPassword = "admin123"; // Ganti dengan password yang diinginkan
    
    console.log("🔐 Membuat hash password menggunakan Argon2...");
    const hashedPassword = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 4096,
      timeCost: 3,
      parallelism: 1
    });
    
    console.log("✅ Hash password berhasil dibuat");

    // Data admin yang akan ditambahkan
    const adminData = {
      name: "Administrator",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin"
    };

    console.log("🔍 Mengecek apakah akun admin sudah ada...");
    
    // Cek apakah admin sudah ada
    const existingAdmin = await Users.findOne({
      where: {
        email: adminData.email
      }
    });

    if (existingAdmin) {
      console.log("⚠️  Akun admin sudah ada!");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Nama:", existingAdmin.name);
      console.log("🔑 Role:", existingAdmin.role);
      console.log("🆔 UUID:", existingAdmin.uuid);
      console.log("\n💡 Jika ingin membuat admin baru, gunakan email yang berbeda");
      return;
    }

    console.log("➕ Menambahkan akun admin baru...");
    
    // Tambahkan akun admin baru
    const newAdmin = await Users.create(adminData);
    
    console.log("✅ Akun admin berhasil ditambahkan!");
    console.log("📧 Email:", newAdmin.email);
    console.log("👤 Nama:", newAdmin.name);
    console.log("🔑 Role:", newAdmin.role);
    console.log("🆔 UUID:", newAdmin.uuid);
    console.log("\n🔐 Informasi Login:");
    console.log("Email: admin@admin.com");
    console.log("Password: admin123");
    console.log("\n🎉 Akun admin siap digunakan!");

  } catch (error) {
    console.error("❌ Gagal menambahkan akun admin:");
    console.error("Error:", error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log("\n💡 Solusi:");
      console.log("1. Pastikan MySQL server berjalan");
      console.log("2. Periksa konfigurasi database di config/Database.js");
      console.log("3. Pastikan database 'auth_db' sudah dibuat");
    } else if (error.name === 'SequelizeValidationError') {
      console.log("\n💡 Solusi:");
      console.log("1. Periksa data yang dimasukkan");
      console.log("2. Pastikan email valid");
      console.log("3. Pastikan password tidak kosong");
    } else {
      console.log("\n💡 Solusi umum:");
      console.log("1. Pastikan semua dependencies terinstall: npm install");
      console.log("2. Periksa koneksi database");
      console.log("3. Periksa log error di atas");
    }
  } finally {
    // Tutup koneksi database
    try {
      await db.close();
      console.log("🔌 Koneksi database ditutup");
    } catch (closeError) {
      console.log("⚠️  Gagal menutup koneksi database:", closeError.message);
    }
  }
};

// Jalankan script
console.log("🚀 Memulai script menambahkan admin...");
addAdminAccount(); 