import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./Onboarding.css";

const API_URL = "http://127.0.0.1:8000";

function Onboarding({ employees = [] }) {
  const [onboarding, setOnboarding] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    joiningDate: "",
    onboardingStatus: "Pending",
    documentsStatus: "Pending",
    notes: "",
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  /* =====================================================
     FETCH ONBOARDING
     ===================================================== */
  useEffect(() => {
    fetchOnboarding();
  }, []);

  const fetchOnboarding = async () => {
    try {
      const response = await axios.get(`${API_URL}/onboarding`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.onboarding || [];
      setOnboarding(data);
    } catch (error) {
      console.error("Error fetching onboarding:", error);
    }
  };

  /* =====================================================
     FORM HANDLERS
     ===================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const clearForm = () => {
    setFormData({
      employeeId: "",
      joiningDate: "",
      onboardingStatus: "Pending",
      documentsStatus: "Pending",
      notes: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      employeeId: String(item.employeeId),
      joiningDate: item.joiningDate,
      onboardingStatus: item.onboardingStatus,
      documentsStatus: item.documentsStatus,
      notes: item.notes || "",
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.employeeId ||
      !formData.joiningDate ||
      !formData.onboardingStatus ||
      !formData.documentsStatus
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const onboardingData = {
        id: editingId !== null ? editingId : Date.now(),
        employeeId: Number(formData.employeeId),
        joiningDate: formData.joiningDate,
        onboardingStatus: formData.onboardingStatus,
        documentsStatus: formData.documentsStatus,
        notes: formData.notes,
      };

      if (editingId !== null) {
        const response = await axios.put(
          `${API_URL}/onboarding/${editingId}`,
          onboardingData
        );
        const updated = response.data?.onboarding || response.data || onboardingData;
        setOnboarding((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item))
        );
        alert("Onboarding record updated successfully");
      } else {
        const response = await axios.post(
          `${API_URL}/onboarding`,
          onboardingData
        );
        const created = response.data?.onboarding || response.data || onboardingData;
        setOnboarding((prev) => [...prev, created]);
        alert("Onboarding record created successfully");
      }

      setIsModalOpen(false);
      clearForm();
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert("Failed to save onboarding record");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this onboarding record?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/onboarding/${id}`);
      setOnboarding((prev) => prev.filter((item) => item.id !== id));
      alert("Onboarding record deleted successfully");
    } catch (error) {
      console.error("Error deleting onboarding:", error);
      alert("Failed to delete onboarding record");
    }
  };

  /* =====================================================
     HELPERS & COMPUTED METRICS
     ===================================================== */
  const getEmployee = (employeeId) => {
    return employees?.find((emp) => Number(emp.id) === Number(employeeId));
  };

  const getEmployeeName = (employeeId) => {
    const emp = getEmployee(employeeId);
    return emp ? emp.name : `Employee #${employeeId}`;
  };

  // Compute checklist milestone progress percentage
  const getOnboardingProgress = (item) => {
    let score = 0;
    if (item.documentsStatus === "Submitted") score += 25;
    if (item.documentsStatus === "Verified") score += 50;

    if (item.onboardingStatus === "In Progress") score += 25;
    if (item.onboardingStatus === "Completed") score = 100;

    return Math.min(Math.max(score, 15), 100);
  };

  const filteredOnboarding = useMemo(() => {
    return onboarding.filter((item) => {
      const emp = getEmployee(item.employeeId);
      const empName = emp ? emp.name.toLowerCase() : "";
      const dept = emp?.department?.toLowerCase() || "";
      const searchText = search.toLowerCase();

      const matchesSearch =
        empName.includes(searchText) ||
        dept.includes(searchText) ||
        String(item.employeeId).includes(searchText) ||
        (item.notes && item.notes.toLowerCase().includes(searchText));

      const matchesStatus =
        filterStatus === "All" || item.onboardingStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [onboarding, employees, search, filterStatus]);

  const totalRecords = onboarding.length;
  const inProgressRecords = onboarding.filter(
    (item) => item.onboardingStatus === "In Progress"
  ).length;
  const verifiedDocsCount = onboarding.filter(
    (item) => item.documentsStatus === "Verified"
  ).length;
  const completedRecords = onboarding.filter(
    (item) => item.onboardingStatus === "Completed"
  ).length;
  const completionRate =
    totalRecords === 0 ? 0 : Math.round((completedRecords / totalRecords) * 100);

  return (
    <div className="onboarding-page">
      {/* Top Header */}
      <div className="onboarding-header">
        <div className="onboarding-header-titles">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            TALENT INTEGRATION & COMPLIANCE
          </div>
          <h1>Onboarding Management</h1>
          <p>Supervise new recruit integration, document verification, and operational readiness.</p>
        </div>

        <div className="onboarding-header-actions">
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
            Add Onboarding
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Identical to Departments */}
      <div className="onboarding-stats-grid">
        <div className="onboarding-stat-card">
          <div className="stat-meta">
            <span>TOTAL ONBOARDING</span>
            <div className="icon-pill orange">👥</div>
          </div>
          <h2>{totalRecords}</h2>
          <div className="stat-footer">
            <span>Active recruits</span>
            <span className="badge-purple">Active</span>
          </div>
        </div>

        <div className="onboarding-stat-card">
          <div className="stat-meta">
            <span>IN PROGRESS</span>
            <div className="icon-pill blue">⚙</div>
          </div>
          <h2>{inProgressRecords}</h2>
          <div className="stat-footer">
            <span>Under integration</span>
            <span className="badge-purple">Progress</span>
          </div>
        </div>

        <div className="onboarding-stat-card">
          <div className="stat-meta">
            <span>DOCUMENTS VERIFIED</span>
            <div className="icon-pill green">★</div>
          </div>
          <h2>{verifiedDocsCount}</h2>
          <div className="stat-footer">
            <span>Verified files</span>
            <span className="badge-green">
              {totalRecords > 0 ? `${Math.round((verifiedDocsCount / totalRecords) * 100)}%` : "0%"}
            </span>
          </div>
        </div>

        <div className="onboarding-stat-card">
          <div className="stat-meta">
            <span>COMPLETION RATE</span>
            <div className="icon-pill purple">✓</div>
          </div>
          <h2>{completionRate}%</h2>
          <div className="stat-footer">
            <span>{completedRecords} completed</span>
            <span className={completionRate >= 80 ? "badge-green" : "badge-orange"}>
              {completionRate >= 80 ? "Optimal" : "Review"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="onboarding-filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search onboarding by recruit name, ID or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-selects-group">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <span className="onboarding-showing-count">
            Showing <strong>{filteredOnboarding.length}</strong> of {totalRecords} records
          </span>
        </div>
      </div>

      {/* Grid Cards View - Departments Style */}
      {viewMode === "grid" && (
        <div className="onboarding-cards-grid">
          {filteredOnboarding.length === 0 ? (
            <div className="empty-onboarding-card">
              <div className="empty-icon-wrap">📋</div>
              <h3>No onboarding records found</h3>
              <p>No records match your search or selected filter status.</p>
            </div>
          ) : (
            filteredOnboarding.map((item) => {
              const emp = getEmployee(item.employeeId);
              const name = getEmployeeName(item.employeeId);
              const progressPct = getOnboardingProgress(item);

              return (
                <div className="onboarding-card" key={item.id}>
                  {/* Card Top */}
                  <div className="onboarding-card-top">
                    <div className="onboarding-title-group">
                      <div className="onboarding-icon-square">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{name}</h3>
                        <p>{emp?.department || "General"} • Joined: {item.joiningDate}</p>
                      </div>
                    </div>

                    <div className="onboarding-card-actions">
                      <button
                        className="action-icon-btn edit"
                        title="Edit Onboarding"
                        onClick={() => handleEdit(item)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Delete Onboarding"
                        onClick={() => handleDelete(item.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="onboarding-progress-section">
                    <div className="onboarding-progress-labels">
                      <span className="label">Checklist Milestones</span>
                      <span className="value">
                        <strong>{item.onboardingStatus}</strong> ({progressPct}%)
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {item.notes && (
                    <div className="onboarding-notes-snippet">
                      <span className="notes-tag">Remarks:</span>
                      <p>{item.notes}</p>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="onboarding-card-footer">
                    <div className="doc-status-group">
                      <span className="footer-label">Docs:</span>
                      <span
                        className={`doc-pill ${
                          item.documentsStatus?.toLowerCase() === "verified"
                            ? "verified"
                            : item.documentsStatus?.toLowerCase() === "submitted"
                            ? "submitted"
                            : "pending"
                        }`}
                      >
                        {item.documentsStatus}
                      </span>
                    </div>

                    <div className="emp-badge-tag">
                      EMP-{String(item.employeeId).padStart(4, "0")}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="onboarding-table-card">
          <table className="onboarding-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>RECORD ID</th>
                <th style={{ minWidth: "220px" }}>EMPLOYEE</th>
                <th style={{ width: "130px" }}>JOINING DATE</th>
                <th style={{ width: "150px" }}>ONBOARDING</th>
                <th style={{ width: "150px" }}>DOCUMENTS</th>
                <th style={{ minWidth: "200px" }}>NOTES</th>
                <th style={{ width: "110px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOnboarding.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No onboarding records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOnboarding.map((item) => {
                  const name = getEmployeeName(item.employeeId);
                  const emp = getEmployee(item.employeeId);

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="record-id-badge">#{item.id}</span>
                      </td>
                      <td>
                        <div className="table-emp-cell">
                          <div className="stack-avatar">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="emp-info-wrap">
                            <strong>{name}</strong>
                            <span>EMP-{String(item.employeeId).padStart(4, "0")} • {emp?.department || "General"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="time-text">{item.joiningDate}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            item.onboardingStatus?.toLowerCase() === "completed"
                              ? "completed"
                              : item.onboardingStatus?.toLowerCase() === "in progress"
                              ? "in-progress"
                              : "pending"
                          }`}
                        >
                          <span className="status-dot"></span>
                          {item.onboardingStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`doc-pill ${
                            item.documentsStatus?.toLowerCase() === "verified"
                              ? "verified"
                              : item.documentsStatus?.toLowerCase() === "submitted"
                              ? "submitted"
                              : "pending"
                          }`}
                        >
                          {item.documentsStatus}
                        </span>
                      </td>
                      <td className="notes-text">{item.notes || "—"}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons-inline">
                          <button
                            className="action-icon-btn edit"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => handleDelete(item.id)}
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">TALENT ACQUISITION</span>
                <h2>{editingId !== null ? "Edit Onboarding" : "Add Employee Onboarding"}</h2>
                <p>Register onboarding milestones, joining schedules, and document compliance.</p>
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
                <label>Select Personnel</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees?.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} (EMP-{String(employee.id).padStart(4, "0")}) —{" "}
                      {employee.department || "General"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Onboarding Status</label>
                  <select
                    name="onboardingStatus"
                    value={formData.onboardingStatus}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Document Verification</label>
                <select
                  name="documentsStatus"
                  value={formData.documentsStatus}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>

              <div className="form-group">
                <label>Operational Notes & Remarks</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="e.g. Background check completed, ID badge pending dispatch..."
                  value={formData.notes}
                  onChange={handleChange}
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
                  {editingId !== null ? "Update Onboarding" : "Record Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Onboarding;