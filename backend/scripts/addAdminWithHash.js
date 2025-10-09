// Script untuk menambahkan akun admin dengan hash password yang sudah ada
import db from "../config/Database.js";
import Users from "../models/UserModel.js";

const addAdminWithExistingHash = async () => {
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

    // Hash password yang sudah diberikan
    const hashedPassword = "argon2id$v=19$m=4096,t=3,p=1$0kUEzlc2sQn6+5leGXE98Q$k6La4Pa8Hoyj/HaJ5PSXg9wQ6v4bY2jMvT0C+OFPE2o";

    // Data admin yang akan ditambahkan
    const adminData = {
      name: "Administrator",
      email: "admin@admin.com",
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
    console.log("Password: (sesuai hash yang diberikan)");
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
console.log("🚀 Memulai script menambahkan admin dengan hash yang sudah ada...");
addAdminWithExistingHash(); 