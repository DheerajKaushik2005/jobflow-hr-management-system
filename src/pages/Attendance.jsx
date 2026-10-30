import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import "./Attendance.css";

const API_URL = "http://127.0.0.1:8000";

// Helper: Get local date formatted as YYYY-MM-DD
const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: Normalize date comparisons across any backend format
const normalizeDate = (rawDate) => {
  if (!rawDate) return "";
  const str = String(rawDate).trim();
  if (str.includes("T")) return str.split("T")[0];
  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    if (parts[2]?.length === 4) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return str;
};

function Attendance({
  attendance: propAttendance = [],
  setAttendance: setParentAttendance,
  employees: propEmployees = [],
  setEmployees: setParentEmployees,
}) {
  const [attendanceList, setAttendanceList] = useState(propAttendance);
  const [employeesList, setEmployeesList] = useState(propEmployees);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual form state
  const [formData, setFormData] = useState({
    employee_id: "",
    date: getLocalDateString(),
    status: "Present",
    check_in: "09:00 AM",
    check_out: "06:00 PM",
    notes: "",
  });

  // 1. Fetch fresh data simultaneously
  const refreshData = useCallback(async () => {
    try {
      const [attRes, empRes] = await Promise.allSettled([
        axios.get(`${API_URL}/attendance`),
        axios.get(`${API_URL}/employees`),
      ]);

      if (attRes.status === "fulfilled") {
        const attData = Array.isArray(attRes.value.data)
          ? attRes.value.data
          : attRes.value.data?.attendance || [];
        setAttendanceList(attData);
        if (typeof setParentAttendance === "function") setParentAttendance(attData);
      }

      if (empRes.status === "fulfilled") {
        const empData = Array.isArray(empRes.value.data)
          ? empRes.value.data
          : empRes.value.data?.employees || [];
        setEmployeesList(empData);
        if (typeof setParentEmployees === "function") setParentEmployees(empData);
      }
    } catch (err) {
      console.error("Attendance fetch error:", err);
    }
  }, [setParentAttendance, setParentEmployees]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 2. Build live roster table for selected date
  const displayRecords = useMemo(() => {
    const targetDate = normalizeDate(selectedDate);

    // Records saved in DB for this date
    const dbRecords = attendanceList.filter((r) => normalizeDate(r.date) === targetDate);

    return employeesList.map((emp) => {
      const existing = dbRecords.find(
        (r) => String(r.employee_id || r.employeeId) === String(emp.id)
      );

      if (existing) {
        const isAbsent = existing.status === "Absent";
        return {
          id: existing.id || `att-${emp.id}-${targetDate}`,
          employee_id: emp.id,
          name: emp.name,
          department: emp.department || "General",
          position: emp.position || "Staff",
          date: targetDate,
          status: existing.status,
          check_in: isAbsent ? "--" : (existing.check_in || existing.checkIn || "09:00 AM"),
          check_out: isAbsent ? "--" : (existing.check_out || existing.checkOut || "06:00 PM"),
          notes: existing.notes || "",
        };
      }

      // Default baseline if not yet marked for today
      return {
        id: `temp-${emp.id}-${targetDate}`,
        employee_id: emp.id,
        name: emp.name,
        department: emp.department || "General",
        position: emp.position || "Staff",
        date: targetDate,
        status: "Present",
        check_in: "09:00 AM",
        check_out: "06:00 PM",
        notes: "",
      };
    });
  }, [employeesList, attendanceList, selectedDate]);

  // 3. Search & tab filtering
  const filteredRecords = useMemo(() => {
    return displayRecords.filter((rec) => {
      const matchesSearch =
        rec.name?.toLowerCase().includes(search.toLowerCase()) ||
        rec.department?.toLowerCase().includes(search.toLowerCase()) ||
        String(rec.employee_id).includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        rec.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [displayRecords, search, statusFilter]);

  // KPI Calculations
  const totalEmployeesCount = employeesList.length;
  const presentCount = displayRecords.filter((r) => r.status === "Present").length;
  const leaveCount = displayRecords.filter((r) => r.status === "Leave").length;
  const absentCount = displayRecords.filter((r) => r.status === "Absent").length;
  const attendanceRate = totalEmployeesCount === 0 ? 0 : Math.round((presentCount / totalEmployeesCount) * 100);

  // 4. Quick Status Changer (P / L / A buttons)
  const handleQuickStatus = async (record, newStatus) => {
    const isAbsent = newStatus === "Absent";
    const payload = {
      employee_id: Number(record.employee_id),
      employeeId: Number(record.employee_id),
      name: record.name,
      department: record.department,
      date: normalizeDate(selectedDate),
      status: newStatus,
      check_in: isAbsent ? "--" : (record.check_in === "--" ? "09:00 AM" : record.check_in),
      check_out: isAbsent ? "--" : (record.check_out === "--" ? "06:00 PM" : record.check_out),
    };

    // Instant UI update
    setAttendanceList((prev) => {
      const remaining = prev.filter(
        (r) =>
          !(String(r.employee_id || r.employeeId) === String(record.employee_id) &&
            normalizeDate(r.date) === normalizeDate(selectedDate))
      );
      return [...remaining, payload];
    });

    try {
      await axios.post(`${API_URL}/attendance`, payload);
    } catch (err) {
      console.warn("Backend update failed, kept in local state:", err);
    }
  };

  // 5. Handle Status change inside modal
  const handleStatusChangeInForm = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
      check_in: status === "Absent" ? "--" : "09:00 AM",
      check_out: status === "Absent" ? "--" : "06:00 PM",
    }));
  };

  // 6. Manual modal submission
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id) {
      alert("Please select an employee");
      return;
    }

    const emp = employeesList.find((e) => String(e.id) === String(formData.employee_id));
    const isAbsent = formData.status === "Absent";
    
    const payload = {
      employee_id: Number(formData.employee_id),
      employeeId: Number(formData.employee_id),
      name: emp?.name || "Staff",
      department: emp?.department || "General",
      date: normalizeDate(formData.date),
      status: formData.status,
      check_in: isAbsent ? "--" : formData.check_in,
      check_out: isAbsent ? "--" : formData.check_out,
      notes: formData.notes || (isAbsent ? "Marked absent" : ""),
    };

    // Instant local state update
    setAttendanceList((prev) => {
      const remaining = prev.filter(
        (r) =>
          !(String(r.employee_id || r.employeeId) === String(payload.employee_id) &&
            normalizeDate(r.date) === normalizeDate(payload.date))
      );
      return [...remaining, payload];
    });

    try {
      await axios.post(`${API_URL}/attendance`, payload);
    } catch (err) {
      console.warn("Backend attendance post error:", err);
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = ["Employee ID,Name,Department,Date,Status,Check In,Check Out"];
    const rows = filteredRecords.map(
      (r) =>
        `"EMP-${String(r.employee_id).padStart(4, "0")}","${r.name}","${r.department}","${r.date}","${r.status}","${r.check_in}","${r.check_out}"`
    );

    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JobFlow_Attendance_${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="att-header">
        <div className="att-header-titles">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            TIME & WORKFORCE TRACKING
          </div>
          <h1>Attendance</h1>
          <p>Monitor daily clock-ins, approve leaves, and verify organizational presence.</p>
        </div>

        <div className="att-header-actions">
          <div className="date-picker-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button className="btn-secondary" type="button" onClick={handleExportCSV}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Log
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                date: selectedDate,
                employee_id: employeesList[0]?.id || "",
                status: "Absent",
                check_in: "--",
                check_out: "--",
              }));
              setIsModalOpen(true);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log Entry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="att-stats-grid">
        <div className="att-stat-card">
          <div className="stat-meta">
            <span>TOTAL SCHEDULED</span>
            <div className="icon-pill blue">👥</div>
          </div>
          <h2>{totalEmployeesCount}</h2>
          <div className="stat-footer">
            <span>Roster headcount</span>
            <span className="badge-purple">Active</span>
          </div>
        </div>

        <div className="att-stat-card">
          <div className="stat-meta">
            <span>PRESENT RATE</span>
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

        <div className="att-stat-card">
          <div className="stat-meta">
            <span>ON SCHEDULED LEAVE</span>
            <div className="icon-pill orange">🌴</div>
          </div>
          <h2>{leaveCount}</h2>
          <div className="stat-footer">
            <span>Approved out</span>
            <span className="badge-purple">Excused</span>
          </div>
        </div>

        <div className="att-stat-card">
          <div className="stat-meta">
            <span>UNEXCUSED ABSENT</span>
            <div className="icon-pill red">✕</div>
          </div>
          <h2>{absentCount}</h2>
          <div className="stat-footer">
            <span>Missing log-ins</span>
            <span className={absentCount === 0 ? "badge-green" : "badge-red"}>
              {absentCount === 0 ? "Zero" : "Action req."}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="att-controls-row">
        <div className="status-tabs">
          {["All", "Present", "Leave", "Absent"].map((status) => (
            <button
              key={status}
              type="button"
              className={statusFilter === status ? "status-tab active" : "status-tab"}
              onClick={() => setStatusFilter(status)}
            >
              {status}
              <span className="tab-count">
                {status === "All"
                  ? displayRecords.length
                  : displayRecords.filter((r) => r.status === status).length}
              </span>
            </button>
          ))}
        </div>

        <div className="att-search-wrap">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search personnel, ID or department..."
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

      {/* Table Card */}
      <div className="att-table-card">
        <div className="table-wrapper">
          <table className="att-table">
            <thead>
              <tr>
                <th style={{ width: "130px" }}>EMPLOYEE ID</th>
                <th style={{ minWidth: "240px" }}>PERSONNEL</th>
                <th style={{ width: "160px" }}>DEPARTMENT</th>
                <th style={{ width: "130px" }}>TIME IN</th>
                <th style={{ width: "130px" }}>TIME OUT</th>
                <th style={{ width: "150px" }}>STATUS</th>
                <th style={{ width: "160px", textAlign: "right" }}>QUICK UPDATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-icon-wrap">📅</div>
                    <h3>No personnel found</h3>
                    <p>No records match your selected status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <span className="emp-id-badge">
                        EMP-{String(record.employee_id).padStart(4, "0")}
                      </span>
                    </td>

                    <td>
                      <div className="personnel-cell">
                        <div className="emp-avatar">
                          {(record.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="person-details">
                          <strong className="person-name">{record.name}</strong>
                          <span className="person-role">{record.position}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="dept-tag">{record.department}</span>
                    </td>

                    <td>
                      <span className="time-badge">{record.check_in}</span>
                    </td>

                    <td>
                      <span className="time-badge">{record.check_out}</span>
                    </td>

                    <td>
                      <span
                        className={`status-pill ${
                          record.status?.toLowerCase() === "present"
                            ? "present"
                            : record.status?.toLowerCase() === "leave"
                            ? "leave"
                            : "absent"
                        }`}
                      >
                        <span className="status-dot"></span>
                        {record.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="quick-toggle-group">
                        <button
                          type="button"
                          className={`toggle-action-btn ${
                            record.status === "Present" ? "active-present" : ""
                          }`}
                          title="Mark Present"
                          onClick={() => handleQuickStatus(record, "Present")}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          className={`toggle-action-btn ${
                            record.status === "Leave" ? "active-leave" : ""
                          }`}
                          title="Mark On Leave"
                          onClick={() => handleQuickStatus(record, "Leave")}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          className={`toggle-action-btn ${
                            record.status === "Absent" ? "active-absent" : ""
                          }`}
                          title="Mark Absent"
                          onClick={() => handleQuickStatus(record, "Absent")}
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal with Scrollbar */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">TIME RECORDING</span>
                <h2>Log Attendance Entry</h2>
                <p>Record or update an employee's presence status.</p>
              </div>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label>Select Personnel</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                >
                  <option value="">Choose Employee</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (EMP-{String(emp.id).padStart(4, "0")}) — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Log Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Attendance Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChangeInForm(e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              {formData.status !== "Absent" ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Check In Time</label>
                    <input
                      type="text"
                      value={formData.check_in}
                      onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Check Out Time</label>
                    <input
                      type="text"
                      value={formData.check_out}
                      onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="absent-note-banner">
                  <span>ℹ️ Check-in and Check-out are disabled for Absent status.</span>
                </div>
              )}

              <div className="form-group">
                <label>Remarks / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Uninformed leave / Sick day"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Record Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;