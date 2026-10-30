import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import "./App.css";

import Sidebar from "./components/sidebar";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Tasks from "./pages/Tasks";
import Onboarding from "./pages/Onboarding";
import Reports from "./pages/Reports";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [onboarding, setOnboarding] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ALL DATA
  // =====================================================

  const fetchAllData = useCallback(async () => {
    try {
      const [
        empRes,
        deptRes,
        attRes,
        leaveRes,
        taskRes,
        onboardingRes,
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/employees`),
        axios.get(`${API_URL}/departments`),
        axios.get(`${API_URL}/attendance`),
        axios.get(`${API_URL}/leaves`),
        axios.get(`${API_URL}/tasks`),
        axios.get(`${API_URL}/onboarding`),
      ]);

      // =================================================
      // EMPLOYEES
      // =================================================

      if (empRes.status === "fulfilled") {
        const data = Array.isArray(empRes.value.data)
          ? empRes.value.data
          : empRes.value.data?.employees || [];

        setEmployees(data);

        console.log(
          "Employees:",
          data
        );
      } else {
        console.error(
          "Employees API error:",
          empRes.reason
        );
      }

      // =================================================
      // DEPARTMENTS
      // =================================================

      if (deptRes.status === "fulfilled") {
        const data = Array.isArray(deptRes.value.data)
          ? deptRes.value.data
          : deptRes.value.data?.departments || [];

        setDepartments(data);

        console.log(
          "Departments:",
          data
        );
      } else {
        console.error(
          "Departments API error:",
          deptRes.reason
        );
      }

      // =================================================
      // ATTENDANCE
      // =================================================

      if (attRes.status === "fulfilled") {
        const data = Array.isArray(attRes.value.data)
          ? attRes.value.data
          : attRes.value.data?.attendance || [];

        setAttendance(data);

        console.log(
          "Attendance:",
          data
        );
      } else {
        console.error(
          "Attendance API error:",
          attRes.reason
        );
      }

      // =================================================
      // LEAVES
      // =================================================

      if (leaveRes.status === "fulfilled") {
        const data = Array.isArray(leaveRes.value.data)
          ? leaveRes.value.data
          : leaveRes.value.data?.leaves || [];

        setLeaves(data);

        console.log(
          "Leaves:",
          data
        );
      } else {
        console.error(
          "Leaves API error:",
          leaveRes.reason
        );
      }

      // =================================================
      // TASKS
      // =================================================

      if (taskRes.status === "fulfilled") {
        const data = Array.isArray(taskRes.value.data)
          ? taskRes.value.data
          : taskRes.value.data?.tasks || [];

        setTasks(data);

        console.log(
          "Tasks:",
          data
        );
      } else {
        console.error(
          "Tasks API error:",
          taskRes.reason
        );
      }

      // =================================================
      // ONBOARDING
      // =================================================

      if (onboardingRes.status === "fulfilled") {
        const data = Array.isArray(
          onboardingRes.value.data
        )
          ? onboardingRes.value.data
          : onboardingRes.value.data?.onboarding || [];

        setOnboarding(data);

        console.log(
          "Onboarding:",
          data
        );
      } else {
        console.error(
          "Onboarding API error:",
          onboardingRes.reason
        );
      }

    } catch (error) {
      console.error(
        "Critical error while loading JobFlow data:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD DATA ON APP START
  // =====================================================

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="loading-wrapper">

        <div className="loading-spinner"></div>

        <p>
          Loading JobFlow...
        </p>

      </div>
    );
  }

  // =====================================================
  // APP LAYOUT
  // =====================================================

  return (
    <div className="app-layout">

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* ================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        <Routes>

          {/* ============================================
              DASHBOARD
          ============================================= */}

          <Route
            path="/"
            element={
              <Dashboard
                employees={employees}
                setEmployees={setEmployees}

                departments={departments}
                setDepartments={setDepartments}

                attendance={attendance}
                setAttendance={setAttendance}

                /* IMPORTANT */
                leaves={leaves}
                setLeaves={setLeaves}

                tasks={tasks}
                setTasks={setTasks}

                onboarding={onboarding}
                setOnboarding={setOnboarding}
              />
            }
          />

          {/* ============================================
              DASHBOARD URL
          ============================================= */}

          <Route
            path="/dashboard"
            element={
              <Dashboard
                employees={employees}
                setEmployees={setEmployees}

                departments={departments}
                setDepartments={setDepartments}

                attendance={attendance}
                setAttendance={setAttendance}

                /* IMPORTANT */
                leaves={leaves}
                setLeaves={setLeaves}

                tasks={tasks}
                setTasks={setTasks}

                onboarding={onboarding}
                setOnboarding={setOnboarding}
              />
            }
          />

          {/* ============================================
              EMPLOYEES
          ============================================= */}

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

          {/* ============================================
              DEPARTMENTS
          ============================================= */}

          <Route
            path="/departments"
            element={
              <Departments
                departments={departments}
                setDepartments={setDepartments}
                employees={employees}
                setEmployees={setEmployees}
              />
            }
          />

          {/* ============================================
              ATTENDANCE
          ============================================= */}

          <Route
            path="/attendance"
            element={
              <Attendance
                attendance={attendance}
                setAttendance={setAttendance}
                employees={employees}
                setEmployees={setEmployees}
              />
            }
          />

          {/* ============================================
              LEAVE
          ============================================= */}

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

          {/* ============================================
              TASKS
          ============================================= */}

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

          {/* ============================================
              ONBOARDING
          ============================================= */}

          <Route
            path="/onboarding"
            element={
              <Onboarding
                employees={employees}
                onboarding={onboarding}
                setOnboarding={setOnboarding}
              />
            }
          />

          {/* ============================================
              REPORTS
          ============================================= */}

          <Route
            path="/reports"
            element={
              <Reports
                employees={employees}
                departments={departments}
                attendance={attendance}
                leaves={leaves}
                tasks={tasks}
                onboarding={onboarding}
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}

export default App;