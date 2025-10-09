import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaUserShield,
  FaUserGraduate,
} from "react-icons/fa";
import { Home } from "lucide-react"; // atau dari library ikon yang kamu pakai

// Warna pie chart untuk Admin, Dosen, Mahasiswa
const COLORS = ["#4F46E5", "#10B981", "#F59E0B"];

// Warna Tailwind eksplisit untuk StatCard
const colorClasses = {
  indigo: {
    bg: "bg-indigo-500",
    text: "text-indigo-700",
  },
  yellow: {
    bg: "bg-yellow-500",
    text: "text-yellow-700",
  },
  green: {
    bg: "bg-green-500",
    text: "text-green-700",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-700",
  },
};

export default function Dashboard() {
  const [stat, setStat] = useState({
    admin: 0,
    dosen: 0,
    mahasiswa: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/statistik/users", {
          withCredentials: true,
        });
        setStat(res.data);
      } catch (err) {
        console.error("Gagal fetch statistik:", err);
      }
    };
    fetchData();
  }, []);

  const data = [
    { name: "Admin", value: stat.admin },
    { name: "Dosen", value: stat.dosen },
    { name: "Mahasiswa", value: stat.mahasiswa },
  ];

  const iconStyle = "text-white text-xl";

  return (
    <div className="space-y-8 px-0">
      {/* Header */}
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Dashboard
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <span className="text-black-500">●</span>
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Pengguna"
          value={stat.total}
          color="indigo"
          icon={<FaUsers className={iconStyle} />}
        />
        <StatCard
          label="Admin"
          value={stat.admin}
          color="yellow"
          icon={<FaUserShield className={iconStyle} />}
        />
        <StatCard
          label="Dosen"
          value={stat.dosen}
          color="green"
          icon={<FaChalkboardTeacher className={iconStyle} />}
        />
        <StatCard
          label="Mahasiswa"
          value={stat.mahasiswa}
          color="amber"
          icon={<FaUserGraduate className={iconStyle} />}
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
          <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
          Jumlah Mahasiswa
        </h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} users`, ""]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Komponen kecil untuk card statistik
function StatCard({ label, value, color, icon }) {
  const { bg, text } = colorClasses[color] || {
    bg: "bg-gray-300",
    text: "text-gray-800",
  };
  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className={`${bg} shadow-inner rounded-full p-3`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${text}`}>{value}</p>
      </div>
    </div>
  );
}
