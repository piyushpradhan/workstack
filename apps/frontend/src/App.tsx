import { Outlet, Route, Routes } from "react-router-dom";
import Login from "@/features/Login";
import Dashboard from "@/features/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/layout";
import Projects from "@/features/Projects";
import ProjectDetail from "@/features/ProjectDetail";

function App() {
  return (
    <Routes>
      <Route element={<Outlet />} >
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
