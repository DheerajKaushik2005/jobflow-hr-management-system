import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Dashboard({
  employees = [],
  departments = [],
  attendance = [],
  leaves = [],
}) {
  const navigate = useNavigate();

  const [liveAttendance, setLiveAttendance] =
    useState(attendance);

  const [liveLeaves, setLiveLeaves] =
    useState(leaves);

  // =====================================================
  // FETCH ATTENDANCE + LEAVES DIRECTLY
  // =====================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attendanceResponse, leavesResponse] =
          await Promise.allSettled([
            axios.get(`${API_URL}/attendance`),
            axios.get(`${API_URL}/leaves`),
          ]);

        // -----------------------------
        // ATTENDANCE
        // -----------------------------

        if (
          attendanceResponse.status === "fulfilled"
        ) {
          const data =
            attendanceResponse.value.data;

          const attendanceData =
            Array.isArray(data)
              ? data
              : Array.isArray(data?.attendance)
              ? data.attendance
              : [];

          setLiveAttendance(attendanceData);

          console.log(
            "Dashboard Attendance:",
            attendanceData
          );
        }

        // -----------------------------
        // LEAVES
        // -----------------------------

        if (
          leavesResponse.status === "fulfilled"
        ) {
          const data =
            leavesResponse.value.data;

          const leaveData =
            Array.isArray(data)
              ? data
              : Array.isArray(data?.leaves)
              ? data.leaves
              : [];

          setLiveLeaves(leaveData);

          console.log(
            "Dashboard Leaves:",
            leaveData
          );
        }
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // ALSO UPDATE WHEN PARENT DATA CHANGES
  // =====================================================

  useEffect(() => {
    if (Array.isArray(attendance)) {
      setLiveAttendance(attendance);
    }
  }, [attendance]);

  useEffect(() => {
    if (Array.isArray(leaves)) {
      setLiveLeaves(leaves);
    }
  }, [leaves]);

  // =====================================================
  // STATUS NORMALIZER
  // =====================================================

  const normalizeStatus = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ");
  };

  // =====================================================
  // BASIC COUNTS
  // =====================================================

  const totalEmployees = employees.length;

  const totalDepartments = departments.length;

  // =====================================================
  // ATTENDANCE
  // =====================================================

  const presentCount = liveAttendance.filter(
    (record) => {
      const status = normalizeStatus(
        record.status
      );

      return (
        status === "present" ||
        status === "p"
      );
    }
  ).length;

  const absentCount = liveAttendance.filter(
    (record) => {
      const status = normalizeStatus(
        record.status
      );

      return (
        status === "absent" ||
        status === "a"
      );
    }
  ).length;

  const leaveAttendanceCount =
    liveAttendance.filter((record) => {
      const status = normalizeStatus(
        record.status
      );

      return (
        status === "leave" ||
        status === "on leave" ||
        status === "l"
      );
    }).length;

  // IMPORTANT:
  // Leave records are NOT included in
  // attendance rate denominator.

  const attendanceWorkingRecords =
    presentCount + absentCount;

  const attendancePercentage =
    attendanceWorkingRecords > 0
      ? Math.round(
          (presentCount /
            attendanceWorkingRecords) *
            100
        )
      : 0;

  // =====================================================
  // TODAY DATE
  // =====================================================

  const today = new Date();

  const todayYear =
    today.getFullYear();

  const todayMonth =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const todayDay =
    String(
      today.getDate()
    ).padStart(2, "0");

  const todayISO =
    `${todayYear}-${todayMonth}-${todayDay}`;

  const todayDMY =
    `${todayDay}-${todayMonth}-${todayYear}`;

  const todaySlash =
    `${todayDay}/${todayMonth}/${todayYear}`;

  // =====================================================
  // DATE HELPER
  // =====================================================

  const convertToDate = (value) => {
    if (!value) {
      return null;
    }

    const text = String(value)
      .trim();

    // YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}/.test(text)
    ) {
      const date = new Date(
        text.substring(0, 10) +
          "T00:00:00"
      );

      return isNaN(date.getTime())
        ? null
        : date;
    }

    // DD-MM-YYYY
    if (
      /^\d{2}-\d{2}-\d{4}$/.test(text)
    ) {
      const [day, month, year] =
        text.split("-");

      const date = new Date(
        `${year}-${month}-${day}T00:00:00`
      );

      return isNaN(date.getTime())
        ? null
        : date;
    }

    // DD/MM/YYYY
    if (
      /^\d{2}\/\d{2}\/\d{4}$/.test(text)
    ) {
      const [day, month, year] =
        text.split("/");

      const date = new Date(
        `${year}-${month}-${day}T00:00:00`
      );

      return isNaN(date.getTime())
        ? null
        : date;
    }

    const date = new Date(text);

    return isNaN(date.getTime())
      ? null
      : date;
  };

  // =====================================================
  // ON LEAVE TODAY FROM APPROVED LEAVES
  // =====================================================

  const approvedLeaveToday =
    liveLeaves.filter((leave) => {
      const status = normalizeStatus(
        leave.status
      );

      const isApproved =
        status === "approved" ||
        status.includes("approved");

      if (!isApproved) {
        return false;
      }

      const fromDate = convertToDate(
        leave.fromDate
      );

      const toDate = convertToDate(
        leave.toDate
      );

      if (!fromDate || !toDate) {
        return false;
      }

      const todayDate = new Date(
        todayYear,
        today.getMonth(),
        today.getDate()
      );

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      return (
        todayDate >= fromDate &&
        todayDate <= toDate
      );
    }).length;

  // =====================================================
  // LEAVE FROM ATTENDANCE
  // =====================================================

  const attendanceLeaveToday =
    liveAttendance.filter((record) => {
      const status = normalizeStatus(
        record.status
      );

      if (
        status !== "leave" &&
        status !== "on leave" &&
        status !== "l"
      ) {
        return false;
      }

      const recordDate =
        String(record.date || "")
          .trim();

      return (
        recordDate.startsWith(
          todayISO
        ) ||
        recordDate === todayDMY ||
        recordDate === todaySlash
      );
    }).length;

  const onLeaveToday =
    approvedLeaveToday > 0
      ? approvedLeaveToday
      : attendanceLeaveToday;

  // =====================================================
  // PENDING LEAVES
  // =====================================================

  const pendingLeaves =
    liveLeaves.filter((leave) => {
      const status = normalizeStatus(
        leave.status
      );

      return (
        status === "pending" ||
        status.includes("pending") ||
        status.includes("approval")
      );
    }).length;

  // =====================================================
  // DEPARTMENT STATS
  // =====================================================

  const departmentStats =
    departments.map((department) => {
      const count =
        employees.filter(
          (employee) =>
            String(
              employee.department || ""
            )
              .trim()
              .toLowerCase() ===
            String(
              department.name || ""
            )
              .trim()
              .toLowerCase()
        ).length;

      const percentage =
        totalEmployees > 0
          ? Math.round(
              (count /
                totalEmployees) *
                100
            )
          : 0;

      return {
        name: department.name,
        employees: count,
        percentage,
      };
    });

  // =====================================================
  // RECENT EMPLOYEES
  // =====================================================

  const recentEmployees = [
    ...employees,
  ]
    .reverse()
    .slice(0, 5);

  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      description: "Active workforce",
      badge: "+4% this month",
      badgeType: "positive",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle
            cx="9"
            cy="7"
            r="4"
          />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },

    {
      title: "Departments",
      value: totalDepartments,
      description: "Active divisions",
      badge: "Healthy spread",
      badgeType: "neutral",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect
            width="16"
            height="20"
            x="4"
            y="2"
            rx="2"
          />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </svg>
      ),
    },

    {
      title: "Attendance Rate",
      value: `${attendancePercentage}%`,
      description:
        `${presentCount} checked in`,
      badge:
        attendancePercentage >= 80
          ? "On Target"
          : "Requires Attention",
      badgeType:
        attendancePercentage >= 80
          ? "positive"
          : "warning",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },

    {
      title: "On Leave",
      value: onLeaveToday,
      description:
        onLeaveToday === 0
          ? "No employees on leave today"
          : "Scheduled out today",
      badge:
        pendingLeaves === 0
          ? "0 pending approval"
          : `${pendingLeaves} pending approval`,
      badgeType:
        pendingLeaves === 0
          ? "neutral"
          : "warning",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect
            width="18"
            height="18"
            x="3"
            y="4"
            rx="2"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
          />
          <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
          />
        </svg>
      ),
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="header-text">

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back, Admin. Here's a
            live overview of your organization.
          </p>

        </div>

        <button
          className="add-employee-btn"
          onClick={() =>
            navigate("/employees")
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
            />

            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
            />
          </svg>

          Add Employee
        </button>

      </header>

      {/* STATS */}

      <section className="stats-grid">

        {stats.map((stat) => (

          <div
            className="stat-card"
            key={stat.title}
          >

            <div className="stat-top">

              <div className="stat-icon-wrapper">
                {stat.icon}
              </div>

              <span
                className={`stat-badge ${stat.badgeType}`}
              >
                {stat.badge}
              </span>

            </div>

            <div className="stat-body">

              <span className="stat-title">
                {stat.title}
              </span>

              <h2 className="stat-value">
                {stat.value}
              </h2>

              <p className="stat-description">
                {stat.description}
              </p>

            </div>

          </div>

        ))}

      </section>

      {/* MAIN GRID */}

      <section className="dashboard-grid">

        {/* DEPARTMENTS */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>
                Department Overview
              </h2>

              <p>
                Workforce distribution by
                active team
              </p>
            </div>

            <button
              className="card-text-action"
              onClick={() =>
                navigate("/departments")
              }
            >
              View all
            </button>

          </div>

          <div className="department-list">

            {departmentStats.length === 0 ? (

              <div className="empty-state">
                <p>
                  No departments configured yet.
                </p>
              </div>

            ) : (

              departmentStats.map(
                (department) => (

                  <div
                    className="department-row"
                    key={department.name}
                  >

                    <div className="department-info">

                      <span className="dept-name">
                        {department.name}
                      </span>

                      <span className="dept-stats">

                        <strong>
                          {department.employees}
                        </strong>

                        <span className="dept-percent">
                          (
                          {department.percentage}
                          %)
                        </span>

                      </span>

                    </div>

                    <div className="progress-bar">

                      <div
                        className="progress"
                        style={{
                          width:
                            `${Math.min(
                              department.percentage,
                              100
                            )}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

        {/* RECENT EMPLOYEES */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Recent Employees
              </h2>

              <p>
                Recently onboarded team members
              </p>

            </div>

            <button
              className="card-text-action"
              onClick={() =>
                navigate("/employees")
              }
            >
              Directory
            </button>

          </div>

          <div className="recent-employees">

            {recentEmployees.length === 0 ? (

              <div className="empty-state">
                <p>
                  No employees recorded yet.
                </p>
              </div>

            ) : (

              recentEmployees.map(
                (employee) => (

                  <div
                    className="employee-item"
                    key={
                      employee.id ||
                      employee.name
                    }
                  >

                    <div className="employee-avatar">
                      {(employee.name || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="employee-info">

                      <strong className="employee-name">
                        {employee.name}
                      </strong>

                      <span className="employee-role">
                        {employee.position ||
                          "Employee"}
                      </span>

                    </div>

                    <span className="employee-department">
                      {employee.department ||
                        "General"}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>

      {/* QUICK ACTIONS */}

      <section className="quick-actions">

        <div className="card-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Common operational shortcuts
              and workflows
            </p>

          </div>

        </div>

        <div className="quick-action-grid">

          <button
            className="action-btn"
            onClick={() =>
              navigate("/employees")
            }
          >

            <div className="action-icon">
              +
            </div>

            <div className="action-content">

              <strong>
                Add Employee
              </strong>

              <span>
                Register new recruit
              </span>

            </div>

          </button>

          <button
            className="action-btn"
            onClick={() =>
              navigate("/departments")
            }
          >

            <div className="action-icon">
              ▦
            </div>

            <div className="action-content">

              <strong>
                Departments
              </strong>

              <span>
                Organize hierarchies
              </span>

            </div>

          </button>

          <button
            className="action-btn"
            onClick={() =>
              navigate("/attendance")
            }
          >

            <div className="action-icon">
              ✓
            </div>

            <div className="action-content">

              <strong>
                Attendance
              </strong>

              <span>
                Track log ins & leaves
              </span>

            </div>

          </button>

          <button
            className="action-btn"
            onClick={() =>
              navigate("/reports")
            }
          >

            <div className="action-icon">
              ▤
            </div>

            <div className="action-content">

              <strong>
                Reports
              </strong>

              <span>
                View organization reports
              </span>

            </div>

          </button>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;