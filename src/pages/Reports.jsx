import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import "./Reports.css";

const API_URL = "http://127.0.0.1:8000";

// Helper: Safely extract array regardless of backend wrapper
const extractArray = (resData, key) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData[key])) return resData[key];
  if (Array.isArray(resData.data)) return resData.data;
  return [];
};

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [onboarding, setOnboarding] = useState([]);

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);

      const [empRes, deptRes, attRes, leavesRes, tasksRes, onbRes] =
        await Promise.allSettled([
          axios.get(`${API_URL}/employees`),
          axios.get(`${API_URL}/departments`),
          axios.get(`${API_URL}/attendance`),
          axios.get(`${API_URL}/leaves`),
          axios.get(`${API_URL}/tasks`),
          axios.get(`${API_URL}/onboarding`),
        ]);

      const empData = empRes.status === "fulfilled" ? extractArray(empRes.value.data, "employees") : [];
      const deptData = deptRes.status === "fulfilled" ? extractArray(deptRes.value.data, "departments") : [];
      const attData = attRes.status === "fulfilled" ? extractArray(attRes.value.data, "attendance") : [];
      const leavesData = leavesRes.status === "fulfilled" ? extractArray(leavesRes.value.data, "leaves") : [];
      const tasksData = tasksRes.status === "fulfilled" ? extractArray(tasksRes.value.data, "tasks") : [];
      const onbData = onbRes.status === "fulfilled" ? extractArray(onbRes.value.data, "onboarding") : [];

      // Debugging in console: Check what backend actually responded
      console.log("REPORTS SYNC DATA:", {
        employees: empData,
        departments: deptData,
        attendance: attData,
        leaves: leavesData,
        tasks: tasksData,
        onboarding: onbData,
      });

      setEmployees(empData);
      setDepartments(deptData);
      setAttendance(attData);
      setLeaves(leavesData);
      setTasks(tasksData);
      setOnboarding(onbData);
    } catch (err) {
      console.error("Reports loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  /* =====================================================
     METRICS CALCULATION (ROBUST & CASE-INSENSITIVE)
     ===================================================== */
  const totalEmployees = employees.length;
  const totalDepartments = departments.length;

  // 1. ATTENDANCE METRICS
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = attendance.filter((r) => String(r.date || "").includes(todayStr));
  const activeAttendance = todayLogs.length > 0 ? todayLogs : attendance;

  const presentCount = activeAttendance.filter((r) =>
    String(r.status || "").toLowerCase().trim() === "present"
  ).length;

  const absentCount = activeAttendance.filter((r) =>
    String(r.status || "").toLowerCase().trim() === "absent"
  ).length;

  // If DB attendance has records use them, otherwise use employees count
  const effectiveTotal = activeAttendance.length > 0 ? activeAttendance.length : totalEmployees;
  const attendanceRate = effectiveTotal === 0 ? 0 : Math.round((presentCount / effectiveTotal) * 100);

  // 2. LEAVE METRICS
  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter((l) =>
    String(l.status || "").toLowerCase().trim() === "pending"
  ).length;
  const approvedLeaves = leaves.filter((l) =>
    String(l.status || "").toLowerCase().trim() === "approved"
  ).length;

  // 3. TASK METRICS
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) =>
    String(t.status || "").toLowerCase().trim() === "completed"
  ).length;
  const inProgressTasks = tasks.filter((t) =>
    String(t.status || "").toLowerCase().trim() === "in progress"
  ).length;
  const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 4. ONBOARDING METRICS
  const totalOnboarding = onboarding.length;
  const completedOnboarding = onboarding.filter((o) =>
    String(o.onboardingStatus || "").toLowerCase().trim() === "completed"
  ).length;
  const onboardingCompletionRate = totalOnboarding === 0 ? 0 : Math.round((completedOnboarding / totalOnboarding) * 100);

  // Department Breakdown
  const departmentStats = useMemo(() => {
    return departments.map((dept) => {
      const deptName = typeof dept === "string" ? dept : dept.name;
      const matchingEmps = employees.filter((emp) => {
        const empDept = emp.department || emp.dept || "";
        return empDept.toLowerCase().trim() === deptName.toLowerCase().trim();
      });

      const count = matchingEmps.length;
      const percentage = totalEmployees === 0 ? 0 : Math.round((count / totalEmployees) * 100);

      return {
        name: deptName,
        count,
        percentage,
        members: matchingEmps,
      };
    });
  }, [departments, employees, totalEmployees]);

  // Module Cards
  const reportCards = useMemo(() => {
    return [
      {
        id: "workforce",
        category: "Workforce",
        title: "Workforce & Hierarchy",
        description: "Staff headcount distributed across organizational teams",
        metricPrimary: totalEmployees,
        metricLabel: `${totalDepartments} Active Divisions`,
        progressLabel: "Largest Team Share",
        progressValue: departmentStats[0] ? departmentStats[0].percentage : 0,
        progressSub: departmentStats[0] ? `${departmentStats[0].count} in ${departmentStats[0].name}` : "No teams",
        members: employees.slice(0, 6),
      },
      {
        id: "attendance",
        category: "Attendance",
        title: "Attendance Performance",
        description: "Roster check-ins, punctuality ratios, and recorded unexcused absences",
        metricPrimary: `${attendanceRate}%`,
        metricLabel: `${presentCount} of ${effectiveTotal} Clocked In`,
        progressLabel: "Present Rate",
        progressValue: attendanceRate,
        progressSub: `${absentCount} unexcused absences logged`,
        members: employees.slice(0, 5),
      },
      {
        id: "leaves",
        category: "Leaves",
        title: "Time Off & Leave Approvals",
        description: "Official absence requests, pending approvals, and PTO utilization",
        metricPrimary: totalLeaves,
        metricLabel: `${approvedLeaves} Approved Requests`,
        progressLabel: "Approval Clearance",
        progressValue: totalLeaves === 0 ? 100 : Math.round((approvedLeaves / totalLeaves) * 100),
        progressSub: `${pendingLeaves} requests awaiting review`,
        members: employees.slice(0, 4),
      },
      {
        id: "tasks",
        category: "Tasks",
        title: "Task Resolution & Operations",
        description: "Operational deliverables, assigned execution deadlines, and throughput",
        metricPrimary: `${taskCompletionRate}%`,
        metricLabel: `${completedTasks} of ${totalTasks} Completed`,
        progressLabel: "Workflow Completion",
        progressValue: taskCompletionRate,
        progressSub: `${inProgressTasks} items currently active`,
        members: employees.slice(0, 5),
      },
      {
        id: "onboarding",
        category: "Onboarding",
        title: "Talent Onboarding & Compliance",
        description: "New recruit integration, documentation checks, and milestone progress",
        metricPrimary: totalOnboarding,
        metricLabel: `${completedOnboarding} Completed Integrations`,
        progressLabel: "Onboarding Milestones",
        progressValue: onboardingCompletionRate,
        progressSub: `${totalOnboarding - completedOnboarding} recruits currently onboarding`,
        members: employees.slice(0, 4),
      },
    ];
  }, [
    totalEmployees,
    totalDepartments,
    departmentStats,
    employees,
    attendanceRate,
    presentCount,
    effectiveTotal,
    absentCount,
    totalLeaves,
    approvedLeaves,
    pendingLeaves,
    taskCompletionRate,
    completedTasks,
    totalTasks,
    inProgressTasks,
    totalOnboarding,
    completedOnboarding,
    onboardingCompletionRate,
  ]);

  const filteredCards = useMemo(() => {
    return reportCards.filter((card) => {
      const matchesSearch =
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        card.description.toLowerCase().includes(search.toLowerCase()) ||
        card.category.toLowerCase().includes(search.toLowerCase());

      const matchesTab = activeTab === "All" || card.category === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [reportCards, search, activeTab]);

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-titles">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            EXECUTIVE AUDIT & ANALYTICS
          </div>
          <h1>Organization Reports</h1>
          <p>Holistic operational audit of workforce headcount, attendance, leaves, and deliverables.</p>
        </div>

        <div className="reports-header-actions">
          <button className="btn-primary" type="button" onClick={fetchReportData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {loading ? "Syncing..." : "Sync Live Data"}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="reports-stats-grid">
        <div className="reports-stat-card">
          <div className="stat-meta">
            <span>TOTAL WORKFORCE</span>
            <div className="icon-pill orange">👥</div>
          </div>
          <h2>{totalEmployees}</h2>
          <div className="stat-footer">
            <span>Across {totalDepartments} teams</span>
            <span className="badge-purple">Active</span>
          </div>
        </div>

        <div className="reports-stat-card">
          <div className="stat-meta">
            <span>ATTENDANCE RATE</span>
            <div className="icon-pill green">✓</div>
          </div>
          <h2>{attendanceRate}%</h2>
          <div className="stat-footer">
            <span>{presentCount} checked in</span>
            <span className={attendanceRate >= 80 ? "badge-green" : "badge-orange"}>
              {attendanceRate >= 80 ? "Optimal" : "Review"}
            </span>
          </div>
        </div>

        <div className="reports-stat-card">
          <div className="stat-meta">
            <span>PENDING ACTIONS</span>
            <div className="icon-pill blue">✦</div>
          </div>
          <h2>{pendingLeaves}</h2>
          <div className="stat-footer">
            <span>Leaves pending</span>
            <span className={pendingLeaves > 0 ? "badge-orange" : "badge-green"}>
              {pendingLeaves > 0 ? "Action Req" : "Clear"}
            </span>
          </div>
        </div>

        <div className="reports-stat-card">
          <div className="stat-meta">
            <span>TASK RESOLUTION</span>
            <div className="icon-pill purple">⚙</div>
          </div>
          <h2>{taskCompletionRate}%</h2>
          <div className="stat-footer">
            <span>{completedTasks} of {totalTasks} completed</span>
            <span className={taskCompletionRate >= 70 ? "badge-green" : "badge-purple"}>
              Balanced
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="reports-filter-bar">
        <div className="status-tabs">
          {["All", "Workforce", "Attendance", "Leaves", "Tasks", "Onboarding"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "status-tab active" : "status-tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="reports-search-wrap">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search audit domains or metrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Cards View */}
      <div className="reports-cards-grid">
        {filteredCards.map((card) => (
          <div className="report-card-module" key={card.id}>
            <div className="report-card-top">
              <div className="report-title-group">
                <div className="report-icon-square">
                  {card.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </div>

              <div className="report-card-badge">
                <span className="badge-purple">{card.metricLabel}</span>
              </div>
            </div>

            <div className="report-progress-section">
              <div className="report-progress-labels">
                <span className="label">{card.progressLabel}</span>
                <span className="value">
                  <strong>{card.progressSub}</strong> ({card.progressValue}%)
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(card.progressValue, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="report-card-footer">
              <div className="report-members-preview">
                <span className="preview-label">Active Roster:</span>
                <div className="avatar-stack">
                  {card.members.map((m) => (
                    <div
                      key={m.id}
                      className="stack-avatar"
                      title={`${m.name} (${m.department || "Staff"})`}
                    >
                      {(m.name || "?").charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="report-metric-tag">
                <strong>{card.metricPrimary}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;