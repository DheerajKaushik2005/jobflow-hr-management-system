import { useState } from "react";
import "./Tasks.css";

function Tasks({
  employees,
  tasks,
  setTasks,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");

  const [editingId, setEditingId] = useState(null);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  // Add / Update Task
  function handleSubmit(event) {
    event.preventDefault();

    if (
      !employeeId ||
      !title ||
      !description ||
      !dueDate
    ) {
      alert("Please fill all fields");
      return;
    }

    const employee = employees.find(
      (item) =>
        item.id === Number(employeeId)
    );

    if (!employee) {
      alert("Please select an employee");
      return;
    }

    // Update
    if (editingId !== null) {
      setTasks(
        tasks.map((task) =>
          task.id === editingId
            ? {
                ...task,
                employeeId: employee.id,
                employeeName: employee.name,
                title: title,
                description: description,
                dueDate: dueDate,
                priority: priority,
                status: status,
              }
            : task
        )
      );

      clearForm();
      return;
    }

    // Add
    const newTask = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      title: title,
      description: description,
      dueDate: dueDate,
      priority: priority,
      status: status,
    };

    setTasks([
      ...tasks,
      newTask,
    ]);

    clearForm();
  }

  // Clear form
  function clearForm() {
    setEmployeeId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("Medium");
    setStatus("Pending");
    setEditingId(null);
  }

  // Edit
  function handleEdit(task) {
    setEditingId(task.id);

    setEmployeeId(
      String(task.employeeId)
    );

    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setStatus(task.status);
  }

  // Delete
  function handleDelete(id) {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (confirmDelete) {
      setTasks(
        tasks.filter(
          (task) => task.id !== id
        )
      );
    }
  }

  // Task summary
  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) =>
      task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "Completed"
  ).length;

  // Search + Filter
  const filteredTasks = tasks.filter(
    (task) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(searchText) ||
        task.description
          .toLowerCase()
          .includes(searchText) ||
        task.employeeName
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

  return (
    <div className="tasks-page">

      <h1>Tasks Management</h1>

      <p className="page-description">
        Assign and manage employee tasks.
      </p>

      {/* SUMMARY CARDS */}

      <div className="task-summary">

        <div className="task-summary-card">
          <span>Total Tasks</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="task-summary-card">
          <span>Pending</span>
          <strong>{pendingTasks}</strong>
        </div>

        <div className="task-summary-card">
          <span>In Progress</span>
          <strong>
            {inProgressTasks}
          </strong>
        </div>

        <div className="task-summary-card">
          <span>Completed</span>
          <strong>
            {completedTasks}
          </strong>
        </div>

      </div>

      {/* FORM */}

      <form
        className="tasks-form"
        onSubmit={handleSubmit}
      >

        <select
          value={employeeId}
          onChange={(event) =>
            setEmployeeId(
              event.target.value
            )
          }
        >
          <option value="">
            Select Employee
          </option>

          {employees.map(
            (employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.name}
              </option>
            )
          )}
        </select>

        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
        />

        <input
          type="date"
          value={dueDate}
          onChange={(event) =>
            setDueDate(
              event.target.value
            )
          }
        />

        <select
          value={priority}
          onChange={(event) =>
            setPriority(
              event.target.value
            )
          }
        >
          <option value="Low">
            Low Priority
          </option>

          <option value="Medium">
            Medium Priority
          </option>

          <option value="High">
            High Priority
          </option>
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

        <button type="submit">
          {editingId !== null
            ? "Update Task"
            : "Add Task"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="cancel-button"
            onClick={clearForm}
          >
            Cancel
          </button>
        )}

      </form>

      {/* SEARCH AND FILTERS */}

      <div className="task-controls">

        <div className="task-search">
          <input
            type="text"
            placeholder="🔍 Search by task, employee or description..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="task-filter">

          <label>
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

        </div>

        <div className="task-filter">

          <label>
            Priority
          </label>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Priority
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

          </select>

        </div>

      </div>

      {/* TASK LIST */}

      <div className="task-list">

        <h2>Task List</h2>

        {filteredTasks.length === 0 ? (

          <p className="empty-message">
            No tasks found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Task
                </th>

                <th>
                  Description
                </th>

                <th>
                  Due Date
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredTasks.map(
                (task) => (

                  <tr
                    key={task.id}
                  >

                    <td>
                      {task.employeeName}
                    </td>

                    <td>
                      {task.title}
                    </td>

                    <td>
                      {task.description}
                    </td>

                    <td>
                      {task.dueDate}
                    </td>

                    <td>

                      <span
                        className={
                          "priority " +
                          task.priority.toLowerCase()
                        }
                      >
                        {task.priority}
                      </span>

                    </td>

                    <td>

                      <span
                        className={
                          "task-status " +
                          task.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )
                        }
                      >
                        {task.status}
                      </span>

                    </td>

                    <td className="actions">

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            task
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            task.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default Tasks;