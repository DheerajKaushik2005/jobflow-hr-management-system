import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Tasks from "./pages/Tasks";

function App() {
  // Employees
  const [employees, setEmployees] = useState([]);

  // Departments
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Engineering",
      description:
        "Software development and technology",
    },
    {
      id: 2,
      name: "Human Resources",
      description:
        "Employee management and recruitment",
    },
    {
      id: 3,
      name: "Marketing",
      description:
        "Marketing and brand management",
    },
  ]);

  // Attendance
  const [attendance, setAttendance] = useState([]);

  // Leave
  const [leaves, setLeaves] = useState([]);

  // Tasks
  const [tasks, setTasks] = useState([]);

  return (
    <div className="app">

      {/* Sidebar */}

      <Sidebar />

      <div className="main-area">

        {/* Navbar */}

        <Navbar />

        <main className="content">

          <Routes>

            {/* =========================
                DASHBOARD
            ========================= */}

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

            {/* =========================
                EMPLOYEES
            ========================= */}

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

            {/* =========================
                DEPARTMENTS
            ========================= */}

            <Route
              path="/departments"
              element={
                <Departments
                  departments={departments}
                  setDepartments={setDepartments}
                />
              }
            />

            {/* =========================
                ATTENDANCE
            ========================= */}

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

            {/* =========================
                LEAVE
            ========================= */}

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

            {/* =========================
                TASKS
            ========================= */}

            <Route
              path="/tasks"
              element={
                <Tasks
                  employees={employees}
                  tasks={tasks}
                  setTasks={setTasks}
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