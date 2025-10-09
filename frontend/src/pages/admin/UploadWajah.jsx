import React, { useState } from "react";
import axios from "axios";

const UploadWajah = () => {
  const [nim, setNim] = useState("");
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !nim) return setMsg("Lengkapi NIM dan gambar.");

    const formData = new FormData();
    formData.append("nim", nim);
    formData.append("image", image);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload-wajah",
        formData,
        {
          withCredentials: true,
        }
      );
      setMsg(res.data.msg);
    } catch (err) {
      setMsg("Upload gagal. Cek server.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem", textAlign: "center", color: "#000" }}>
        Upload Wajah Mahasiswa
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label style={{ color: "#000", fontWeight: "bold" }}>NIM:</label>
          <input
            type="text"
            placeholder="Masukkan NIM"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "1rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label style={{ color: "#000", fontWeight: "bold" }}>
            Foto Wajah:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#000",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
      </form>

      {msg && (
        <p
          style={{
            marginTop: "1rem",
            textAlign: "center",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {msg}
        </p>
      )}
    </div>
  );
};

export default UploadWajah;
