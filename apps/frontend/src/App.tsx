import { Outlet, Route, Routes } from "react-router-dom";
import Login from "@/features/Login";
import Dashboard from "@/features/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/layout";
import Projects from "@/features/Projects";
import ProjectDetail from "@/features/ProjectDetail";
import ProjectSettings from "@/features/ProjectSettings";
import Tasks from "@/features/Tasks";
import TaskDetail from "./features/TaskDetail";
import TaskSettings from "./features/TaskSettings";
import Settings from "./features/Settings";

function App() {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/settings" element={<ProjectSettings />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/:id/settings" element={<TaskSettings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
