import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { FaBookReader } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function MahasiswaDashboard() {
  const [totalMatkul, setTotalMatkul] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/dashboard/mahasiswa",
          {
            withCredentials: true,
          }
        );
        setTotalMatkul(res.data.totalMatakuliah);
        setChartData(res.data.chartData);
      } catch (err) {
        console.error("Gagal memuat data mahasiswa:", err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto pb-16 bg-gray-50">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Dashboard
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/mahasiswa"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Kartu Total Matkul */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 mb-6 flex items-center gap-4 transform hover:scale-[1.02] transition-all duration-200">
        <div className="bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-xl shadow-lg">
          <FaBookReader className="text-white text-2xl" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">
            Mata Kuliah Diikuti
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalMatkul}</p>
        </div>
      </div>

      {/* Chart Presensi */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
          <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
          Persentase Kehadiran
        </h2>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500 italic">Belum ada data presensi.</p>
          </div>
        ) : (
          <div className="w-full h-[600px] bg-white rounded-lg p-4 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                barGap={2}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  dataKey="matakuliah"
                  type="category"
                  tick={{ fill: "#374151", fontWeight: 500, fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  width={150}
                  tickFormatter={(value) => {
                    // Split long text into multiple lines
                    const words = value.split(" ");
                    const lines = [];
                    let currentLine = "";

                    words.forEach((word) => {
                      if ((currentLine + " " + word).length <= 20) {
                        currentLine += (currentLine ? " " : "") + word;
                      } else {
                        lines.push(currentLine);
                        currentLine = word;
                      }
                    });
                    if (currentLine) lines.push(currentLine);

                    return lines.join("\n");
                  }}
                />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={false}
                />
                <Bar
                  dataKey="persenPresensi"
                  barSize={20}
                  isAnimationActive={true}
                  radius={[4, 4, 4, 4]}
                >
                  <LabelList
                    dataKey="persenPresensi"
                    position="right"
                    formatter={(val) => `${val}%`}
                    style={{ fill: "#111827", fontWeight: 600, fontSize: 12 }}
                  />
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.persenPresensi >= 75
                          ? "#10B981"
                          : entry.persenPresensi >= 50
                          ? "#F59E0B"
                          : "#EF4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
