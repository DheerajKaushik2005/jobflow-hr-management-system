import { useEffect, useState } from "react";
import axios from "axios";
import "./Emp.css";

const API_URL = "http://127.0.0.1:8000";

function Employees({ employees = [], setEmployees, departments = [] }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
    position: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"

  // =========================================
  // FETCH EMPLOYEES
  // =========================================
  useEffect(() => {
    axios
      .get(`${API_URL}/employees`)
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });
  }, [setEmployees]);

  // =========================================
  // FORM HELPERS
  // =========================================
  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      email: "",
      department: "",
      position: "",
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    // Pre-fill next likely ID (optional helper)
    const nextId = employees.length > 0 
      ? Math.max(...employees.map(e => Number(e.id) || 0)) + 1 
      : 1;
    setForm((prev) => ({ ...prev, id: String(nextId) }));
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // SAVE / UPDATE EMPLOYEE
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.id ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.department ||
      !form.position.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    const employeeData = {
      id: Number(form.id),
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department,
      position: form.position.trim(),
    };

    try {
      if (editingId !== null) {
        const response = await axios.put(
          `${API_URL}/employees/${editingId}`,
          employeeData
        );

        setEmployees(
          employees.map((employee) =>
            employee.id === editingId
              ? (response.data.employee || { ...employee, ...employeeData })
              : employee
          )
        );
        alert("Employee updated successfully");
      } else {
        const response = await axios.post(
          `${API_URL}/employees`,
          employeeData
        );

        const newEmployee = response.data.employee || employeeData;
        setEmployees([...employees, newEmployee]);
        alert("Employee added successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Something went wrong while saving employee");
    }
  };

  // =========================================
  // EDIT EMPLOYEE
  // =========================================
  const handleEdit = (employee) => {
    setForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
    });
    setEditingId(employee.id);
    setIsModalOpen(true);
  };

  // =========================================
  // DELETE EMPLOYEE
  // =========================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/employees/${id}`);
      setEmployees(employees.filter((employee) => employee.id !== id));
      alert("Employee deleted successfully");

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Something went wrong while deleting employee");
    }
  };

  // =========================================
  // SEARCH & FILTER
  // =========================================
  const filteredEmployees = employees.filter((employee) => {
    const name = employee.name?.toLowerCase() || "";
    const email = employee.email?.toLowerCase() || "";
    const position = employee.position?.toLowerCase() || "";
    const id = String(employee.id || "").toLowerCase();
    const searchValue = search.toLowerCase();

    const matchesSearch =
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      position.includes(searchValue) ||
      id.includes(searchValue);

    const matchesDepartment =
      filterDepartment === "" || employee.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const totalPositions = new Set(
    employees.map((employee) => employee.position).filter(Boolean)
  ).size;

  // =========================================
  // EXPORT CSV
  // =========================================
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) {
      alert("No employees available to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Name",
      "Email",
      "Department",
      "Position",
      "Status",
    ];

    const rows = filteredEmployees.map((employee) => [
      `EMP-${String(employee.id).padStart(4, "0")}`,
      employee.name,
      employee.email,
      employee.department,
      employee.position,
      "Active",
    ]);

    const csvRows = [headers, ...rows].map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          if (
            text.includes(",") ||
            text.includes('"') ||
            text.includes("\n")
          ) {
            return `"${text.replace(/"/g, '""')}"`;
          }
          return text;
        })
        .join(",")
    );

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JobFlow_Employees_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="employees-page">
      {/* =========================================
          TOP HEADER
      ========================================= */}
      <div className="employees-top">
        <div className="employees-header">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            WORKFORCE DIRECTORY & MANAGEMENT
          </div>
          <h1>Employees</h1>
          <p>
            Manage credentials, track team assignments, and onboard your personnel.
          </p>
        </div>

        <div className="employees-header-actions">
          <button
            className="export-btn"
            type="button"
            onClick={handleExportCSV}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          <div className="view-switcher">
            <button
              type="button"
              className={viewMode === "list" ? "view-btn active" : "view-btn"}
              onClick={() => setViewMode("list")}
              title="Table View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className={viewMode === "grid" ? "view-btn active" : "view-btn"}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>

          <button
            className="add-employee-btn"
            type="button"
            onClick={handleOpenAddModal}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* =========================================
          SUMMARY METRICS CARDS
      ========================================= */}
      <div className="employee-stats">
        <div className="employee-stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">TOTAL</p>
              <p className="stat-sublabel">HEADCOUNT</p>
            </div>
            <div className="stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{totalEmployees}</div>
          <div className="stat-bottom">
            <span>Current Employees</span>
            <strong className="badge-purple">100%</strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">VISIBLE</p>
              <p className="stat-sublabel">EMPLOYEES</p>
            </div>
            <div className="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{filteredEmployees.length}</div>
          <div className="stat-bottom">
            <span>After Filters</span>
            <strong className="badge-green">Live</strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">DEPARTMENTS</p>
              <p className="stat-sublabel">AVAILABLE</p>
            </div>
            <div className="stat-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M16 14h.01M12 14h.01" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{totalDepartments}</div>
          <div className="stat-bottom">
            <span>Organization</span>
            <strong className="badge-purple">Active</strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">POSITIONS</p>
              <p className="stat-sublabel">TRACKED</p>
            </div>
            <div className="stat-icon violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{totalPositions}</div>
          <div className="stat-bottom">
            <span>Unique Roles</span>
            <strong className="badge-purple">Tracked</strong>
          </div>
        </div>
      </div>

      {/* =========================================
          DEPARTMENT FILTER TABS & SEARCH
      ========================================= */}
      <div className="filter-controls-row">
        <div className="department-tabs-wrapper">
          <button
            type="button"
            className={filterDepartment === "" ? "dept-tab active" : "dept-tab"}
            onClick={() => setFilterDepartment("")}
          >
            All Departments
          </button>
          {departments.map((dept) => (
            <button
              type="button"
              key={dept.id || dept.name}
              className={
                filterDepartment === dept.name ? "dept-tab active" : "dept-tab"
              }
              onClick={() => setFilterDepartment(dept.name)}
            >
              {dept.name}
            </button>
          ))}
        </div>

        <div className="search-and-meta">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, role or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
          <span className="showing-indicator">
            Showing <strong>{filteredEmployees.length}</strong> of {employees.length}
          </span>
        </div>
      </div>

      {/* =========================================
          DIRECTORY VIEW: LIST / TABLE
      ========================================= */}
      {viewMode === "list" && (
        <div className="directory-card">
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  <th style={{ width: "130px" }}>EMPLOYEE ID</th>
                  <th style={{ minWidth: "260px" }}>PERSONNEL & CONTACT</th>
                  <th style={{ width: "180px" }}>DEPARTMENT</th>
                  <th style={{ minWidth: "180px" }}>ROLE & TYPE</th>
                  <th style={{ width: "120px" }}>STATUS</th>
                  <th style={{ width: "110px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                      <h3>No employees found</h3>
                      <p>Try refining your search query or selecting another department.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <span className="emp-id-badge">
                          EMP-{String(employee.id).padStart(4, "0")}
                        </span>
                      </td>

                      <td>
                        <div className="personnel-cell">
                          <div className="emp-avatar">
                            {(employee.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="emp-contact-details">
                            <strong className="emp-name">{employee.name}</strong>
                            <span className="emp-email" title={employee.email}>
                              {employee.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="dept-tag">
                          {employee.department || "General"}
                        </span>
                      </td>

                      <td>
                        <div className="role-cell">
                          <strong className="emp-position">
                            {employee.position || "Staff"}
                          </strong>
                          <span className="emp-type">Full Time</span>
                        </div>
                      </td>

                      <td>
                        <span className="status-badge active">
                          <span className="status-dot"></span>
                          Active
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="action-icon-btn edit-btn"
                            title="Edit Employee"
                            onClick={() => handleEdit(employee)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            title="Delete Employee"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
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

      {/* =========================================
          DIRECTORY VIEW: GRID
      ========================================= */}
      {viewMode === "grid" && (
        <div className="directory-card">
          {filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3>No employees found</h3>
              <p>Try refining your search query or selecting another department.</p>
            </div>
          ) : (
            <div className="employee-cards-grid">
              {filteredEmployees.map((employee) => (
                <div className="emp-grid-card" key={employee.id}>
                  <div className="grid-card-top">
                    <span className="emp-id-badge">
                      EMP-{String(employee.id).padStart(4, "0")}
                    </span>
                    <span className="status-badge active">
                      <span className="status-dot"></span>
                      Active
                    </span>
                  </div>

                  <div className="grid-card-profile">
                    <div className="emp-avatar large">
                      {(employee.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <h3>{employee.name}</h3>
                    <p className="grid-role">{employee.position || "Staff"}</p>
                    <p className="grid-email">{employee.email}</p>
                  </div>

                  <div className="grid-meta-row">
                    <div>
                      <span className="meta-label">Department</span>
                      <strong className="meta-value">{employee.department}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Schedule</span>
                      <strong className="meta-value">Full Time</strong>
                    </div>
                  </div>

                  <div className="grid-card-actions">
                    <button
                      type="button"
                      className="grid-btn edit"
                      onClick={() => handleEdit(employee)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="grid-btn delete"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          ADD / EDIT EMPLOYEE MODAL DIALOG
      ========================================= */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">EMPLOYEE MANAGEMENT</span>
                <h2>{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>
                <p>Enter official personnel details below.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={resetForm}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="number"
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    disabled={editingId !== null}
                    placeholder="e.g. 1001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id || dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Position / Role</label>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingId !== null ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;