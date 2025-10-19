import { Outlet, Route, Routes } from "react-router-dom";
import Login from "@/features/Login";
import Dashboard from "@/features/Dashboard";

function App() {
  return (
    <Routes>
      <Route element={<Outlet />} >
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
