import { useEffect, useState } from "react";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Redirect ke login jika tidak ada user (opsional)
      // window.location.href = '/login';
      console.log("Tidak ada user tersimpan di localStorage"); // Tambahkan ini untuk debugging
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center text-black">
        {user ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
            <p className="text-gray-600">
              You are logged in as <strong>{user.role}</strong>
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold">Loading...</h1>
        )}
      </div>
    </div>
  );
}

export default Home;
