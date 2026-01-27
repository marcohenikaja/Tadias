// // src/App.js
// import React, { useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   Outlet,
// } from "react-router-dom";

// import MainLayout from "./layout/MainLayout";

// import Accueil from "./pages/Accueil.jsx";
// import Login from "./pages/Login";

// import Dashboard from "./pages/Dashboard";
// import Tresorerie from "./pages/Tresorerie";
// import Activite from "./pages/Activite";
// import ImportExcel from "./pages/ImportExcel";
// import Charges from "./pages/Charges";
// import ImportFactures from "./pages/ImportFactures";
// import AdminUsers from "./pages/AdminUsers";
// import ImportsManager from "./pages/ImportsManager";

// // ✅ wrapper pour protéger les routes
// function RequireAuth({ isAuthenticated }) {
//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
// }

// function App() {
//   const [mode, setMode] = useState("light");
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     !!localStorage.getItem("token")
//   );

//   const handleLogin = () => setIsAuthenticated(true);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsAuthenticated(false);
//   };

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* ✅ Accueil (publique) en dehors du dashboard */}
//         <Route path="/" element={<Accueil />} />

//         {/* ✅ Login (publique) */}
//         <Route path="/login" element={<Login onLogin={handleLogin} />} />

//         {/* ✅ Zone protégée */}
//         <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
//           <Route
//             path="/app"
//             element={
//               <MainLayout mode={mode} setMode={setMode} onLogout={handleLogout}>
//                 <Outlet />
//               </MainLayout>
//             }
//           >
//             {/* /app -> /app/dashboard */}
//             <Route index element={<Navigate to="dashboard" replace />} />

//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="tresorerie" element={<Tresorerie />} />
//             <Route path="activite" element={<Activite />} />
//             <Route path="import" element={<ImportExcel />} />
//             <Route path="charge" element={<Charges />} />
//             <Route path="import-factures" element={<ImportFactures />} />
//             <Route path="admin-users" element={<AdminUsers />} />
//             <Route path="imports-manager" element={<ImportsManager />} />

//             {/* fallback dans /app */}
//             <Route path="*" element={<Navigate to="dashboard" replace />} />
//           </Route>
//         </Route>

//         {/* (Optionnel) compat: si tu avais déjà /dashboard etc. */}
//         <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
//         <Route path="/tresorerie" element={<Navigate to="/app/tresorerie" replace />} />
//         <Route path="/activite" element={<Navigate to="/app/activite" replace />} />
//         <Route path="/import" element={<Navigate to="/app/import" replace />} />
//         <Route path="/charge" element={<Navigate to="/app/charge" replace />} />
//         <Route path="/import-factures" element={<Navigate to="/app/import-factures" replace />} />
//         <Route path="/admin-users" element={<Navigate to="/app/admin-users" replace />} />
//         <Route path="/imports-manager" element={<Navigate to="/app/imports-manager" replace />} />

//         {/* fallback global */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import MainLayout from "./layout/MainLayout";

import Accueil from "./pages/Accueil.jsx";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Tresorerie from "./pages/Tresorerie";
import Activite from "./pages/Activite";
import ImportExcel from "./pages/ImportExcel";
import Charges from "./pages/Charges";
import ImportFactures from "./pages/ImportFactures";
import AdminUsers from "./pages/AdminUsers";
import ImportsManager from "./pages/ImportsManager";

// ✅ wrapper pour protéger les routes
function RequireAuth({ isAuthenticated }) {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  const [mode, setMode] = useState("light");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Accueil (publique) en dehors du dashboard */}
        <Route path="/" element={<Accueil />} />

        {/* ✅ Login (publique) */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* ✅ Zone protégée */}
        <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
          <Route
            path="/app"
            element={
              <MainLayout mode={mode} setMode={setMode} onLogout={handleLogout}>
                <Outlet />
              </MainLayout>
            }
          >
            {/* /app -> /app/dashboard */}
            <Route index element={<Navigate to="dashboard" replace mode={mode}/>} />

            <Route path="dashboard" element={<Dashboard mode={mode}/>} />
            <Route path="tresorerie" element={<Tresorerie mode={mode}/>} />
            <Route path="activite" element={<Activite mode={mode}/>} />
            <Route path="import" element={<ImportExcel mode={mode}/>} />

            {/* ✅ ICI: on passe mode */}
            <Route path="charge" element={<Charges mode={mode} />} />

            <Route path="import-factures" element={<ImportFactures mode={mode}/>} />
            <Route path="admin-users" element={<AdminUsers mode={mode}/>} />
           <Route path="imports-manager" element={<ImportsManager mode={mode} />} />


            {/* fallback dans /app */}
            <Route path="*" element={<Navigate to="dashboard" replace mode={mode}/>} />
          </Route>
        </Route>

        {/* (Optionnel) compat: si tu avais déjà /dashboard etc. */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace mode={mode}/>} />
        <Route path="/tresorerie" element={<Navigate to="/app/tresorerie" replace mode={mode}/>} />
        <Route path="/activite" element={<Navigate to="/app/activite" replace mode={mode}/>} />
        <Route path="/import" element={<Navigate to="/app/import" replace mode={mode}/>} />
        <Route path="/charge" element={<Navigate to="/app/charge" replace mode={mode}/>} />
        <Route path="/import-factures" element={<Navigate to="/app/import-factures" replace mode={mode}/>} />
        <Route path="/admin-users" element={<Navigate to="/app/admin-users" replace mode={mode}/>} />
        <Route path="/imports-manager" element={<Navigate to="/app/imports-manager" replace mode={mode}/>} />

        {/* fallback global */}
        <Route path="*" element={<Navigate to="/" replace mode={mode}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
