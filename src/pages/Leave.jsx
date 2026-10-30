import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "./Leave.css";

const API_URL = "http://127.0.0.1:8000";

function Leave({ employees = [], leaves = [], setLeaves }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("Pending");

  // Fetch leaves on initial mount
  useEffect(() => {
    if (typeof setLeaves === "function") {
      axios
        .get(`${API_URL}/leaves`)
        .then((response) => {
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.leaves || [];
          setLeaves(data);
        })
        .catch((error) => {
          console.error("Error fetching leaves:", error);
        });
    }
  }, [setLeaves]);

  // Modal handlers
  const handleOpenAdd = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const handleEdit = (leave) => {
    setEditingId(leave.id);
    setEmployeeId(String(leave.employeeId));
    setLeaveType(leave.leaveType);
    setFromDate(leave.fromDate);
    setToDate(leave.toDate);
    setReason(leave.reason);
    setStatus(leave.status);
    setIsModalOpen(true);
  };

  const clearForm = () => {
    setEmployeeId("");
    setLeaveType("Casual Leave");
    setFromDate("");
    setToDate("");
    setReason("");
    setStatus("Pending");
    setEditingId(null);
  };

  // Submit Leave (Create or Update)
  async function handleSubmit(event) {
    event.preventDefault();

    if (!employeeId || !leaveType || !fromDate || !toDate || !reason || !status) {
      alert("Please fill all fields");
      return;
    }

    if (toDate < fromDate) {
      alert("To date cannot be before from date");
      return;
    }

    const selectedEmployee = employees.find(
      (employee) => employee.id === Number(employeeId)
    );

    if (!selectedEmployee) {
      alert("Employee not found");
      return;
    }

    const leaveData = {
      id: editingId !== null ? editingId : Date.now(),
      employeeId: selectedEmployee.id,
      leaveType,
      fromDate,
      toDate,
      reason,
      status,
    };

    try {
      if (editingId !== null) {
        const response = await axios.put(
          `${API_URL}/leaves/${editingId}`,
          leaveData
        );
        const updated = response.data?.leave || leaveData;
        setLeaves(leaves.map((leave) => (leave.id === editingId ? updated : leave)));
        alert("Leave updated successfully");
      } else {
        const response = await axios.post(`${API_URL}/leaves`, leaveData);
        const newLeave = response.data?.leave || response.data || leaveData;
        setLeaves([...leaves, newLeave]);
        alert("Leave added successfully");
      }

      setIsModalOpen(false);
      clearForm();
    } catch (error) {
      console.error("Error saving leave:", error);
      alert("Something went wrong while saving leave");
    }
  }

  // Delete Individual Leave Request
  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this leave request?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/leaves/${id}`);
      setLeaves(leaves.filter((leave) => leave.id !== id));
      alert("Leave deleted successfully");
    } catch (error) {
      console.error("Error deleting leave:", error);
      alert("Something went wrong while deleting leave");
    }
  }

  // Delete all leave requests in a category
  async function handleDeleteCategoryLeaves(cat) {
    if (cat.leaves.length === 0) {
      alert(`No active leave requests to delete under ${cat.name}.`);
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete all ${cat.leaves.length} leave requests under "${cat.name}"?`
    );
    if (!confirmDelete) return;

    try {
      for (const item of cat.leaves) {
        await axios.delete(`${API_URL}/leaves/${item.id}`);
      }
      setLeaves((prev) =>
        prev.filter((l) => l.leaveType?.toLowerCase() !== cat.name.toLowerCase())
      );
      alert(`All leaves under ${cat.name} have been deleted.`);
    } catch (error) {
      console.error("Error deleting category leaves:", error);
      alert("Failed to delete some leave records.");
    }
  }

  // Group leave data by category cards
  const categoryCards = useMemo(() => {
    const categories = [
      {
        name: "Casual Leave",
        description: "Short notice time off for unforeseen personal matters",
      },
      {
        name: "Sick Leave",
        description: "Paid time off for illness, medical appointments, and recovery",
      },
      {
        name: "Earned Leave",
        description: "Accrued vacation time off for rest and personal travel",
      },
      {
        name: "Emergency Leave",
        description: "Unplanned urgent family and health emergency leave",
      },
    ];

    const totalStaff = employees.length || 1;

    return categories.map((cat, index) => {
      const activeLeaves = leaves.filter(
        (l) => l.leaveType?.toLowerCase() === cat.name.toLowerCase()
      );

      const memberIds = [...new Set(activeLeaves.map((l) => l.employeeId))];
      const members = memberIds
        .map((id) => employees.find((e) => e.id === id))
        .filter(Boolean);

      const count = activeLeaves.length;
      const percentage = Math.round((count / totalStaff) * 100);

      return {
        id: index + 1,
        name: cat.name,
        description: cat.description,
        count,
        percentage,
        members,
        leaves: activeLeaves,
      };
    });
  }, [leaves, employees]);

  // Search filter
  const filteredCategories = useMemo(() => {
    return categoryCards.filter(
      (cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [categoryCards, search]);

  const filteredRawLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const emp = employees.find((e) => e.id === leave.employeeId);
      const name = emp ? emp.name.toLowerCase() : "";
      return (
        name.includes(search.toLowerCase()) ||
        leave.leaveType.toLowerCase().includes(search.toLowerCase()) ||
        leave.reason.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [leaves, employees, search]);

  // KPI calculations
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const largestLeaveCategory = [...categoryCards].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="leaves-page">
      {/* Top Header */}
      <div className="leaves-header">
        <div className="leaves-header-titles">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            TIME OFF & ABSENCE POLICIES
          </div>
          <h1>Leave Management</h1>
          <p>Configure leave categories, track applications, and balance team capacity.</p>
        </div>

        <div className="leaves-header-actions">
          <div className="view-switcher">
            <button
              type="button"
              className={viewMode === "grid" ? "view-btn active" : "view-btn"}
              onClick={() => setViewMode("grid")}
              title="Grid Cards"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              className={viewMode === "table" ? "view-btn active" : "view-btn"}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <button className="btn-primary" type="button" onClick={handleOpenAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Apply Leave
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="leaves-stats-grid">
        <div className="leaves-stat-card">
          <div className="stat-meta">
            <span>TOTAL REQUESTS</span>
            <div className="icon-pill orange">📋</div>
          </div>
          <h2>{leaves.length}</h2>
          <div className="stat-footer">
            <span>All recorded logs</span>
            <span className="badge-purple">Active</span>
          </div>
        </div>

        <div className="leaves-stat-card">
          <div className="stat-meta">
            <span>APPROVED LEAVES</span>
            <div className="icon-pill purple">✓</div>
          </div>
          <h2>{approvedCount}</h2>
          <div className="stat-footer">
            <span>Confirmed absences</span>
            <span className="badge-green">Approved</span>
          </div>
        </div>

        <div className="leaves-stat-card">
          <div className="stat-meta">
            <span>LARGEST CATEGORY</span>
            <div className="icon-pill green">★</div>
          </div>
          <h2>{largestLeaveCategory ? largestLeaveCategory.count : 0}</h2>
          <div className="stat-footer">
            <span className="truncate-text">{largestLeaveCategory?.name || "None"}</span>
            <span className="badge-green">
              {largestLeaveCategory ? `${largestLeaveCategory.percentage}%` : "0%"}
            </span>
          </div>
        </div>

        <div className="leaves-stat-card">
          <div className="stat-meta">
            <span>PENDING APPROVAL</span>
            <div className="icon-pill blue">✦</div>
          </div>
          <h2>{pendingCount}</h2>
          <div className="stat-footer">
            <span>Awaiting review</span>
            <span className={pendingCount > 0 ? "badge-orange" : "badge-green"}>
              {pendingCount > 0 ? "Action Req" : "Clear"}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="leaves-filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search leaves by name, employee, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <span className="leaves-showing-count">
          Showing <strong>{viewMode === "grid" ? filteredCategories.length : filteredRawLeaves.length}</strong> entries
        </span>
      </div>

      {/* Grid Cards View */}
      {viewMode === "grid" && (
        <div className="leaves-cards-grid">
          {filteredCategories.map((cat) => (
            <div className="leave-card" key={cat.id}>
              <div className="leave-card-top">
                <div className="leave-title-group">
                  <div className="leave-icon-square">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="leave-card-actions">
                  <button
                    type="button"
                    className="action-icon-btn edit"
                    title="Apply Under This Category"
                    onClick={() => {
                      setLeaveType(cat.name);
                      setIsModalOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="action-icon-btn delete"
                    title="Clear All Leaves Under This Category"
                    onClick={() => handleDeleteCategoryLeaves(cat)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Headcount Share Progress Bar */}
              <div className="leave-progress-section">
                <div className="leave-progress-labels">
                  <span className="label">Headcount Share</span>
                  <span className="value">
                    <strong>{cat.count}</strong> {cat.count === 1 ? "employee" : "employees"} ({cat.percentage}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Team Members Avatar Stack */}
              <div className="leave-members-preview">
                <span className="preview-label">Team Members:</span>
                {cat.members.length === 0 ? (
                  <span className="no-members-tag">No members assigned</span>
                ) : (
                  <div className="avatar-stack">
                    {cat.members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="stack-avatar"
                        title={`${m.name} (${m.department || "Staff"})`}
                      >
                        {(m.name || "?").charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {cat.members.length > 5 && (
                      <div className="stack-avatar more">+{cat.members.length - 5}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="leaves-table-card">
          <table className="leaves-table">
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>EMPLOYEE</th>
                <th style={{ minWidth: "150px" }}>LEAVE TYPE</th>
                <th style={{ width: "130px" }}>FROM</th>
                <th style={{ width: "130px" }}>TO</th>
                <th style={{ minWidth: "200px" }}>REASON</th>
                <th style={{ width: "130px" }}>STATUS</th>
                <th style={{ width: "120px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRawLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                filteredRawLeaves.map((leave) => {
                  const employee = employees.find((e) => e.id === leave.employeeId);
                  return (
                    <tr key={leave.id}>
                      <td>
                        <div className="table-emp-cell">
                          <div className="stack-avatar">
                            {(employee?.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <strong>{employee ? employee.name : `EMP-${leave.employeeId}`}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="leave-badge">{leave.leaveType}</span>
                      </td>
                      <td className="time-text">{leave.fromDate}</td>
                      <td className="time-text">{leave.toDate}</td>
                      <td className="reason-text">{leave.reason}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            leave.status?.toLowerCase() === "approved"
                              ? "approved"
                              : leave.status?.toLowerCase() === "rejected"
                              ? "rejected"
                              : "pending"
                          }`}
                        >
                          <span className="status-dot"></span>
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons-inline">
                          <button
                            className="action-icon-btn edit"
                            onClick={() => handleEdit(leave)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => handleDelete(leave.id)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">TIME OFF SYSTEM</span>
                <h2>{editingId !== null ? "Edit Leave Request" : "Apply For Leave"}</h2>
                <p>Register official employee leave and adjust workload schedules.</p>
              </div>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} (EMP-{String(employee.id).padStart(4, "0")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Medical emergency or personal travel"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
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
                  {editingId !== null ? "Update Leave" : "Submit Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;