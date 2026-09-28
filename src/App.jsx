import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";

function App() {

  const [employees, setEmployees] = useState([]);

  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Engineering",
      description: "Software development and technology",
    },
    {
      id: 2,
      name: "Human Resources",
      description: "Employee management and recruitment",
    },
    {
      id: 3,
      name: "Marketing",
      description: "Marketing and brand management",
    },
  ]);

  const [attendance, setAttendance] = useState([]);

  // Shared leave state
  const [leaves, setLeaves] = useState([]);

  return (
    <div className="app">

      <Sidebar />

      <div className="main-area">

        <Navbar />

        <main className="content">

          <Routes>

            <Route
              path="/"
              element={
                <Dashboard
                  employees={employees}
                  departments={departments}
                  attendance={attendance}
                />
              }
            />

            <Route
              path="/dashboard"
              element={
                <Dashboard
                  employees={employees}
                  departments={departments}
                  attendance={attendance}
                />
              }
            />

            <Route
              path="/employees"
              element={
                <Employees
                  employees={employees}
                  setEmployees={setEmployees}
                  departments={departments}
                />
              }
            />

            <Route
              path="/departments"
              element={
                <Departments
                  departments={departments}
                  setDepartments={setDepartments}
                />
              }
            />

            <Route
              path="/attendance"
              element={
                <Attendance
                  employees={employees}
                  attendance={attendance}
                  setAttendance={setAttendance}
                  leaves={leaves}
                />
              }
            />

            <Route
              path="/leave"
              element={
                <Leave
                  employees={employees}
                  leaves={leaves}
                  setLeaves={setLeaves}
                />
              }
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}

export default App;