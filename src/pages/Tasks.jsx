import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./Tasks.css";

const API_URL = "http://127.0.0.1:8000";

function Tasks({ employees = [] }) {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [taskData, setTaskData] = useState({
    employeeId: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  /* =====================================================
     FETCH TASKS
     ===================================================== */
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.tasks || [];
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  /* =====================================================
     FORM HANDLERS
     ===================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const clearForm = () => {
    setTaskData({
      employeeId: "",
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    });
    setEditingId(null);
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTaskData({
      employeeId: String(task.employeeId),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !taskData.employeeId ||
      !taskData.title ||
      !taskData.description ||
      !taskData.dueDate
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const selectedEmployee = employees.find(
        (employee) => String(employee.id) === String(taskData.employeeId)
      );

      if (!selectedEmployee) {
        alert("Please select a valid employee.");
        return;
      }

      const dataToSend = {
        id: editingId !== null ? editingId : Date.now(),
        employeeId: Number(taskData.employeeId),
        employeeName: selectedEmployee.name,
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
      };

      if (editingId !== null) {
        const response = await axios.put(
          `${API_URL}/tasks/${editingId}`,
          dataToSend
        );
        const updated = response.data?.task || response.data || dataToSend;
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
        alert("Task updated successfully.");
      } else {
        const response = await axios.post(`${API_URL}/tasks`, dataToSend);
        const created = response.data?.task || response.data || dataToSend;
        setTasks((prev) => [...prev, created]);
        alert("Task added successfully.");
      }

      setIsModalOpen(false);
      clearForm();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Unable to save task.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      alert("Task deleted successfully.");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Unable to delete task.");
    }
  };

  /* =====================================================
     FILTER & KPI CALCULATIONS
     ===================================================== */
  const getEmployee = (employeeId) => {
    return employees.find(
      (employee) => String(employee.id) === String(employeeId)
    );
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const emp = getEmployee(task.employeeId);
      const empName = emp ? emp.name.toLowerCase() : "";
      const searchText = search.toLowerCase();

      const matchesSearch =
        String(task.id).toLowerCase().includes(searchText) ||
        empName.includes(searchText) ||
        String(task.title || "").toLowerCase().includes(searchText) ||
        String(task.description || "").toLowerCase().includes(searchText);

      const matchesStatus =
        filterStatus === "All" || task.status === filterStatus;

      const matchesPriority =
        filterPriority === "All" || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, employees, search, filterStatus, filterPriority]);

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "High").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Helper to compute card progress percentage based on task status
  const getTaskProgress = (status) => {
    if (status === "Completed") return 100;
    if (status === "In Progress") return 50;
    return 15; // Pending baseline
  };

  return (
    <div className="tasks-page">
      {/* Top Header */}
      <div className="tasks-header">
        <div className="tasks-header-titles">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            WORKFLOW & OBJECTIVE TRACKING
          </div>
          <h1>Task Management</h1>
          <p>Organize team deliverables, assign deadlines, and review operational execution.</p>
        </div>

        <div className="tasks-header-actions">
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
            Add Task
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Identical to Departments */}
      <div className="tasks-stats-grid">
        <div className="tasks-stat-card">
          <div className="stat-meta">
            <span>TOTAL ASSIGNMENTS</span>
            <div className="icon-pill orange">💼</div>
          </div>
          <h2>{totalTasks}</h2>
          <div className="stat-footer">
            <span>Active deliverables</span>
            <span className="badge-purple">Live</span>
          </div>
        </div>

        <div className="tasks-stat-card">
          <div className="stat-meta">
            <span>IN PROGRESS</span>
            <div className="icon-pill blue">⚙</div>
          </div>
          <h2>{inProgressTasks}</h2>
          <div className="stat-footer">
            <span>Under execution</span>
            <span className="badge-purple">Active</span>
          </div>
        </div>

        <div className="tasks-stat-card">
          <div className="stat-meta">
            <span>HIGH PRIORITY</span>
            <div className="icon-pill green">★</div>
          </div>
          <h2>{highPriorityTasks}</h2>
          <div className="stat-footer">
            <span>Urgent focus</span>
            <span className={highPriorityTasks > 0 ? "badge-orange" : "badge-green"}>
              {highPriorityTasks > 0 ? "Critical" : "Clear"}
            </span>
          </div>
        </div>

        <div className="tasks-stat-card">
          <div className="stat-meta">
            <span>COMPLETION RATE</span>
            <div className="icon-pill purple">✓</div>
          </div>
          <h2>{completionRate}%</h2>
          <div className="stat-footer">
            <span>{completedTasks} completed</span>
            <span className={completionRate >= 75 ? "badge-green" : "badge-orange"}>
              {completionRate >= 75 ? "Balanced" : "Review"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="tasks-filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks by title, description, or personnel..."
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

          <select
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <span className="tasks-showing-count">
            Showing <strong>{filteredTasks.length}</strong> of {totalTasks} tasks
          </span>
        </div>
      </div>

      {/* Grid Cards View - Departments Style */}
      {viewMode === "grid" && (
        <div className="tasks-cards-grid">
          {filteredTasks.length === 0 ? (
            <div className="empty-tasks-card">
              <div className="empty-icon-wrap">📋</div>
              <h3>No tasks found</h3>
              <p>No tasks matched your search or selected filter filters.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const assignedEmp = getEmployee(task.employeeId);
              const progressPct = getTaskProgress(task.status);

              return (
                <div className="task-card" key={task.id}>
                  {/* Card Top */}
                  <div className="task-card-top">
                    <div className="task-title-group">
                      <div className="task-icon-square">
                        {(task.title || "T").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                      </div>
                    </div>

                    <div className="task-card-actions">
                      <button
                        className="action-icon-btn edit"
                        title="Edit Task"
                        onClick={() => handleEdit(task)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Delete Task"
                        onClick={() => handleDelete(task.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="task-progress-section">
                    <div className="task-progress-labels">
                      <span className="label">Delivery Progress</span>
                      <span className="value">
                        <strong>{task.status}</strong> ({progressPct}%)
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Footer: Assignee & Priority */}
                  <div className="task-card-footer">
                    <div className="assignee-preview">
                      <span className="preview-label">Assigned:</span>
                      {assignedEmp ? (
                        <div className="avatar-stack">
                          <div
                            className="stack-avatar"
                            title={`${assignedEmp.name} (${assignedEmp.department || "Staff"})`}
                          >
                            {assignedEmp.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="assignee-name">{assignedEmp.name}</span>
                        </div>
                      ) : (
                        <span className="no-members-tag">Unassigned</span>
                      )}
                    </div>

                    <div className="task-badges-row">
                      <span
                        className={`priority-pill ${
                          task.priority?.toLowerCase() === "high"
                            ? "high"
                            : task.priority?.toLowerCase() === "medium"
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="due-date-badge">{task.dueDate}</span>
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
        <div className="tasks-table-card">
          <table className="tasks-table">
            <thead>
              <tr>
                <th style={{ width: "100px" }}>TASK ID</th>
                <th style={{ minWidth: "220px" }}>TITLE & SCOPE</th>
                <th style={{ minWidth: "180px" }}>ASSIGNEE</th>
                <th style={{ width: "130px" }}>DUE DATE</th>
                <th style={{ width: "120px" }}>PRIORITY</th>
                <th style={{ width: "140px" }}>STATUS</th>
                <th style={{ width: "110px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const emp = getEmployee(task.employeeId);
                  return (
                    <tr key={task.id}>
                      <td>
                        <span className="task-id-badge">TSK-{task.id}</span>
                      </td>
                      <td>
                        <div className="table-task-info">
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                        </div>
                      </td>
                      <td>
                        <div className="table-emp-cell">
                          <div className="stack-avatar">
                            {(emp?.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <span>{emp ? emp.name : `EMP-${task.employeeId}`}</span>
                        </div>
                      </td>
                      <td className="time-text">{task.dueDate}</td>
                      <td>
                        <span
                          className={`priority-pill ${
                            task.priority?.toLowerCase() === "high"
                              ? "high"
                              : task.priority?.toLowerCase() === "medium"
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            task.status?.toLowerCase() === "completed"
                              ? "completed"
                              : task.status?.toLowerCase() === "in progress"
                              ? "in-progress"
                              : "pending"
                          }`}
                        >
                          <span className="status-dot"></span>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons-inline">
                          <button
                            className="action-icon-btn edit"
                            onClick={() => handleEdit(task)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => handleDelete(task.id)}
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
                <span className="modal-eyebrow">TASK DISPATCH</span>
                <h2>{editingId !== null ? "Update Task" : "Add New Task"}</h2>
                <p>Assign deliverables, timelines, and execution priorities.</p>
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
                <label>Assigned Personnel</label>
                <select
                  name="employeeId"
                  value={taskData.employeeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} (EMP-{String(employee.id).padStart(4, "0")}) —{" "}
                      {employee.department || "General"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Implement OAuth Flow or Refactor Database Schema"
                  value={taskData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={taskData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Execution Status</label>
                <select
                  name="status"
                  value={taskData.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Detailed Scope / Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Outline key acceptance criteria and deliverables..."
                  value={taskData.description}
                  onChange={handleChange}
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
                  {editingId !== null ? "Update Task" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;