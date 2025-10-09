import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import MahasiswaDashboardLayout from "./components/MahasiswaDashboardLayout";
import AdminDashboardLayout from "./components/AdminDashboardLayout";
import DashboardHome from "./pages/admin/Dashboard";
import RequestAkun from "./pages/admin/RequestAkun";
import DataAkun from "./pages/admin/DataAkun";
import MatakuliahAbsen from "./pages/admin/DataMatakuliahDanAbsen";
import Profile from "./pages/admin/Profile";
import MahasiswaProfile from "./pages/mahasiswa/MahasiswaProfile";
import MahasiswaMatakuliah from "./pages/mahasiswa/MahasiswaMatakuliah";
import MahasiswaDashboard from "./pages/mahasiswa/MahasiswaDashboard";
import DosenDashboard from "./pages/dosen/DosenDashboard";
import DosenMatakuliah from "./pages/dosen/DosenMatakuliah";
import DosenProfile from "./pages/dosen/DosenProfile";
import DosenDashboardLayout from "./components/DosenDashboardLayout";
import EditProfileAdmin from "./pages/admin/EditProfileAdmin";
import EditProfileMahasiswa from "./pages/mahasiswa/MahasiswaEditProfile";
import EditProfileDosen from "./pages/dosen/DosenEditProfile";
import TambahMatakuliah from "./pages/dosen/DosenTambahMatakuliah";
import AdminTambahMatakuliah from "./pages/admin/AdminTambahMatakuliah";
import DetailMatakuliah from "./pages/dosen/DosenDetailMatakuliah";
import DosenTambahKelas from "./pages/dosen/DosenTambahKelas";
import DosenEditMatakuliah from "./pages/dosen/DosenEditMatakuliah";
import MatakuliahAbsenDetail from "./pages/admin/DataMatakuliahDanAbsenDetail";
import EditMatakuliahAbsen from "./pages/admin/EditDataMatakuliahDanAbsen";
import DetailMatakuliahMahasiswa from "./pages/mahasiswa/MahasiswaDetailMatakuliah";
import DataAkunEdit from "./pages/admin/EditDataAkun";
import DosenEnrolledMahasiswa from "./pages/dosen/DosenEnrolledMahasiswa";
import AdminEnrolledMahasiswa from "./pages/admin/AdminEnrolledMahasiswa";
import UploadWajah from "./pages/admin/UploadWajah";
import PresensiPage from "./pages/mahasiswa/PresensiPage";
import DosenPresensiKelas from "./pages/dosen/DosenPresensiDetail";
import MahasiswaPresensiStatus from "./pages/mahasiswa/MahasiswaPresensiSaya";
import TambahAkun from "./pages/admin/TambahAkun";
import PageTransition from "./components/PageTransition";
import UnknownFaceGallery from "./pages/admin/UnknownFaceGallery";
import AdminTambahKelas from './pages/admin/AdminTambahKelas.jsx';
import AdminPresensiDetail from './pages/admin/AdminPresensiDetail.jsx';

function App() {
  return (
    <HashRouter>
      <PageTransition>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="request" element={<RequestAkun />} />
            <Route path="data-akun" element={<DataAkun />} />
            <Route path="data-akun/edit/:uuid" element={<DataAkunEdit />} />
            <Route path="matakuliah-absen" element={<MatakuliahAbsen />} />
            <Route path="matakuliah/tambah" element={<AdminTambahMatakuliah />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfileAdmin />} />
            <Route path="data-akun/tambah" element={<TambahAkun />} />
            <Route
              path="matakuliah/:uuid"
              element={<MatakuliahAbsenDetail />}
            />
            <Route
              path="matakuliah/:uuid/enrolled"
              element={<AdminEnrolledMahasiswa />}
            />
            <Route path="uploadwajah" element={<UploadWajah />} />
            <Route
              path="matakuliah/:uuid/edit"
              element={<EditMatakuliahAbsen />}
            />
            <Route path="unknown-faces" element={<UnknownFaceGallery />} />
            <Route path="matakuliah/:uuid/tambah-kelas" element={<AdminTambahKelas />} />
            <Route path="matakuliah/:uuid/kelas/:kelasUuid/presensi" element={<AdminPresensiDetail />} />
          </Route>

          <Route path="/mahasiswa" element={<MahasiswaDashboardLayout />}>
            <Route index element={<MahasiswaDashboard />} />
            <Route path="matakuliah" element={<MahasiswaMatakuliah />} />
            <Route path="Profile" element={<MahasiswaProfile />} />
            <Route
              path="profile/edit/:uuid"
              element={<EditProfileMahasiswa />}
            />
            <Route path="presensi" element={<PresensiPage />} />
            <Route
              path="matakuliah/:uuid"
              element={<DetailMatakuliahMahasiswa />}
            />
            <Route
              path="kelas/:kelasUuid/presensi/:matakuliahUuid"
              element={<MahasiswaPresensiStatus />}
            />
          </Route>

          <Route path="/dosen" element={<DosenDashboardLayout />}>
            <Route index element={<DosenDashboard />} />
            <Route path="matakuliah" element={<DosenMatakuliah />} />
            <Route path="Profile" element={<DosenProfile />} />
            <Route path="Profile/edit" element={<EditProfileDosen />} />
            <Route path="matakuliah/tambah" element={<TambahMatakuliah />} />
            <Route path="matakuliah/:uuid" element={<DetailMatakuliah />} />
            <Route
              path="matakuliah/:uuid/kelas/tambah"
              element={<DosenTambahKelas />}
            />
            <Route
              path="matakuliah/:uuid/edit"
              element={<DosenEditMatakuliah />}
            />
            <Route
              path="matakuliah/:uuid/enrolled"
              element={<DosenEnrolledMahasiswa />}
            />
            <Route
              path="matakuliah/:uuid/presensi/:kelasUuid"
              element={<DosenPresensiKelas />}
            />
          </Route>
        </Routes>
      </PageTransition>
    </HashRouter>
  );
}

export default App;
