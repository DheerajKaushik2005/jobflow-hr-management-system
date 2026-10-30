import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "./Departments.css";

const API_URL = "http://127.0.0.1:8000";

// Robust matcher to ensure variations like "human", "hr", and "Human Resources" match correctly
const isDeptMatch = (empDept, deptName) => {
  if (!empDept || !deptName) return false;

  const d1 = String(empDept).trim().toLowerCase();
  const d2 = String(deptName).trim().toLowerCase();

  if (d1 === d2) return true;

  // Handle HR variations
  if (
    (d1 === "hr" || d1 === "human" || d1.includes("human resource")) &&
    (d2 === "hr" || d2 === "human" || d2.includes("human resource"))
  ) {
    return true;
  }

  // Handle Engineering variations
  if (d1.includes("engineer") && d2.includes("engineer")) return true;

  // Handle Marketing variations
  if (d1.includes("market") && d2.includes("market")) return true;

  // Handle Sales variations
  if (d1.includes("sale") && d2.includes("sale")) return true;

  return false;
};

function Departments({
  departments: initialDepartments = [],
  employees: propEmployees = [],
  setDepartments: setParentDepartments,
  setEmployees: setParentEmployees,
}) {
  const [employeesList, setEmployeesList] = useState(propEmployees);
  const [departmentsList, setDepartmentsList] = useState(initialDepartments);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // 1. Fetch fresh employees directly from backend on mount
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.employees || [];
      setEmployeesList(data);
      if (typeof setParentEmployees === "function") {
        setParentEmployees(data);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  // 2. Fetch fresh departments directly from backend on mount
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.departments || [];
      if (data.length > 0) {
        setDepartmentsList(data);
        if (typeof setParentDepartments === "function") {
          setParentDepartments(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Sync if props update
  useEffect(() => {
    if (propEmployees && propEmployees.length > 0) {
      setEmployeesList(propEmployees);
    }
  }, [propEmployees]);

  useEffect(() => {
    if (initialDepartments && initialDepartments.length > 0) {
      setDepartmentsList(initialDepartments);
    }
  }, [initialDepartments]);

  // 3. Compute dynamic counts, share %, and active members
  const departmentData = useMemo(() => {
    const totalStaff = employeesList.length;

    return departmentsList.map((dept) => {
      const deptName = typeof dept === "string" ? dept : dept.name;
      const deptId = typeof dept === "object" ? dept.id : dept;
      const deptDesc = dept.description || "Core organizational team";

      // Checks department, dept, or department_name keys
      const assignedEmployees = employeesList.filter((emp) => {
        const empDeptValue =
          emp.department || emp.dept || emp.department_name || "";
        return isDeptMatch(empDeptValue, deptName);
      });

      const staffCount = assignedEmployees.length;
      const percentage =
        totalStaff === 0 ? 0 : Math.round((staffCount / totalStaff) * 100);

      return {
        id: deptId,
        name: deptName,
        description: deptDesc,
        count: staffCount,
        percentage,
        members: assignedEmployees,
      };
    });
  }, [departmentsList, employeesList]);

  // 4. Search filtering
  const filteredDepartments = useMemo(() => {
    return departmentData.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(search.toLowerCase()) ||
        dept.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [departmentData, search]);

  const totalStaffAssigned = employeesList.filter(
    (e) => e.department || e.dept || e.department_name
  ).length;
  const largestDepartment = [...departmentData].sort(
    (a, b) => b.count - a.count
  )[0];
  const avgStaffPerDept = departmentsList.length
    ? Math.round(totalStaffAssigned / departmentsList.length)
    : 0;

  // Handlers
  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a department name");
      return;
    }

    try {
      if (editingDept) {
        try {
          await axios.put(`${API_URL}/departments/${editingDept.id}`, formData);
        } catch (err) {
          console.warn("Backend PUT fallback to local state", err);
        }

        setDepartmentsList((prev) =>
          prev.map((d) =>
            (typeof d === "object" ? d.id : d) === editingDept.id
              ? {
                  ...d,
                  name: formData.name.trim(),
                  description: formData.description.trim(),
                }
              : d
          )
        );
        alert("Department updated successfully");
      } else {
        let newDepartment = {
          id: Date.now(),
          name: formData.name.trim(),
          description:
            formData.description.trim() || "Operational division",
        };

        try {
          const res = await axios.post(`${API_URL}/departments`, newDepartment);
          if (res.data?.department) newDepartment = res.data.department;
          else if (res.data && typeof res.data === "object" && res.data.id)
            newDepartment = res.data;
        } catch (err) {
          console.warn("Backend POST fallback to local state", err);
        }

        setDepartmentsList((prev) => [...prev, newDepartment]);
        alert("Department added successfully");
      }

      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to save department");
    }
  };

  const handleDelete = async (dept) => {
    if (dept.count > 0) {
      const confirmForce = window.confirm(
        `This department currently has ${dept.count} employee(s) assigned. Are you sure you want to delete it?`
      );
      if (!confirmForce) return;
    } else {
      const confirmDelete = window.confirm(
        `Delete the department "${dept.name}"?`
      );
      if (!confirmDelete) return;
    }

    try {
      await axios.delete(`${API_URL}/departments/${dept.id}`);
    } catch (err) {
      console.warn("Backend DELETE fallback to local state", err);
    }

    setDepartmentsList((prev) =>
      prev.filter((d) => (typeof d === "object" ? d.id : d) !== dept.id)
    );
    alert("Department deleted successfully");
  };

  return (
    <div className="departments-page">
      {/* Header */}
      <div className="dept-header">
        <div className="dept-header-titles">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            ORGANIZATION HIERARCHY
          </div>
          <h1>Departments</h1>
          <p>
            Configure company divisions, track team sizing, and balance headcount.
          </p>
        </div>

        <div className="dept-header-actions">
          <div className="view-switcher">
            <button
              type="button"
              className={viewMode === "grid" ? "view-btn active" : "view-btn"}
              onClick={() => setViewMode("grid")}
              title="Grid Cards"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <button className="btn-primary" type="button" onClick={handleOpenAdd}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Department
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="dept-stats-grid">
        <div className="dept-stat-card">
          <div className="stat-meta">
            <span>TOTAL DEPARTMENTS</span>
            <div className="icon-pill orange">🏢</div>
          </div>
          <h2>{departmentsList.length}</h2>
          <div className="stat-footer">
            <span>Active divisions</span>
            <span className="badge-purple">Active</span>
          </div>
        </div>

        <div className="dept-stat-card">
          <div className="stat-meta">
            <span>TOTAL STAFF ASSIGNED</span>
            <div className="icon-pill purple">👥</div>
          </div>
          <h2>{totalStaffAssigned}</h2>
          <div className="stat-footer">
            <span>Across all teams</span>
            <span className="badge-green">100%</span>
          </div>
        </div>

        <div className="dept-stat-card">
          <div className="stat-meta">
            <span>LARGEST TEAM</span>
            <div className="icon-pill green">★</div>
          </div>
          <h2>{largestDepartment ? largestDepartment.count : 0}</h2>
          <div className="stat-footer">
            <span className="truncate-text">
              {largestDepartment?.name || "None"}
            </span>
            <span className="badge-green">
              {largestDepartment ? `${largestDepartment.percentage}%` : "0%"}
            </span>
          </div>
        </div>

        <div className="dept-stat-card">
          <div className="stat-meta">
            <span>AVG TEAM CAPACITY</span>
            <div className="icon-pill blue">✦</div>
          </div>
          <h2>{avgStaffPerDept}</h2>
          <div className="stat-footer">
            <span>Members / Division</span>
            <span className="badge-purple">Balanced</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="dept-filter-bar">
        <div className="search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search departments by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <span className="dept-showing-count">
          Showing <strong>{filteredDepartments.length}</strong> of{" "}
          {departmentsList.length} departments
        </span>
      </div>

      {/* Grid Cards View */}
      {viewMode === "grid" && (
        <div className="dept-card-container">
          {filteredDepartments.length === 0 ? (
            <div className="dept-empty-state">
              <div className="empty-icon-wrap">🏢</div>
              <h3>No departments found</h3>
              <p>
                Try searching for a different keyword or create a new department.
              </p>
            </div>
          ) : (
            <div className="dept-cards-grid">
              {filteredDepartments.map((dept) => (
                <div className="dept-card" key={dept.id || dept.name}>
                  <div className="dept-card-top">
                    <div className="dept-title-group">
                      <div className="dept-icon-square">
                        {dept.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{dept.name}</h3>
                        <p>{dept.description}</p>
                      </div>
                    </div>

                    <div className="dept-card-actions">
                      <button
                        className="action-icon-btn edit"
                        title="Edit Department"
                        onClick={() => handleOpenEdit(dept)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Delete Department"
                        onClick={() => handleDelete(dept)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Headcount Progress */}
                  <div className="dept-progress-section">
                    <div className="dept-progress-labels">
                      <span className="label">Headcount Share</span>
                      <span className="value">
                        <strong>{dept.count}</strong>{" "}
                        {dept.count === 1 ? "employee" : "employees"} (
                        {dept.percentage}%)
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(dept.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Assigned Members Stack */}
                  <div className="dept-members-preview">
                    <span className="preview-label">Team Members:</span>
                    {dept.members.length === 0 ? (
                      <span className="no-members-tag">No members assigned</span>
                    ) : (
                      <div className="avatar-stack">
                        {dept.members.slice(0, 5).map((member) => (
                          <div
                            key={member.id}
                            className="stack-avatar"
                            title={`${member.name} (${
                              member.position || "Staff"
                            })`}
                          >
                            {(member.name || "?").charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {dept.members.length > 5 && (
                          <div className="stack-avatar more">
                            +{dept.members.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="dept-table-card">
          <div className="table-wrapper">
            <table className="dept-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "220px" }}>DEPARTMENT NAME</th>
                  <th style={{ minWidth: "260px" }}>DESCRIPTION</th>
                  <th style={{ width: "160px" }}>HEADCOUNT</th>
                  <th style={{ minWidth: "200px" }}>WORKFORCE SHARE</th>
                  <th style={{ width: "100px", textAlign: "right" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No departments match your search.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id || dept.name}>
                      <td>
                        <div className="table-dept-cell">
                          <div className="dept-icon-square small">
                            {dept.name.charAt(0).toUpperCase()}
                          </div>
                          <strong>{dept.name}</strong>
                        </div>
                      </td>
                      <td className="dept-desc-cell">{dept.description}</td>
                      <td>
                        <span className="headcount-badge">
                          <strong>{dept.count}</strong> members
                        </span>
                      </td>
                      <td>
                        <div className="table-progress-cell">
                          <div className="progress-bar-bg small">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(dept.percentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="percent-text">
                            {dept.percentage}%
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons-inline">
                          <button
                            className="action-icon-btn edit"
                            onClick={() => handleOpenEdit(dept)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => handleDelete(dept)}
                            title="Delete"
                          >
                            ✕
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
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">DEPARTMENT MANAGEMENT</span>
                <h2>
                  {editingDept ? "Edit Department" : "Add Department"}
                </h2>
                <p>Define division title and role scope.</p>
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
                <label>Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description / Scope</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Software engineering, infrastructure, and technical operations"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
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
                  {editingDept ? "Update Department" : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;