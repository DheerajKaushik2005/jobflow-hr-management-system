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
      (item) => item.id === Number(employeeId)
    );

    if (!employee) {
      alert("Please select an employee");
      return;
    }

    // UPDATE TASK

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

    // ADD TASK

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

  function clearForm() {
    setEmployeeId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("Medium");
    setStatus("Pending");
    setEditingId(null);
  }

  function handleEdit(task) {
    setEditingId(task.id);

    setEmployeeId(
      String(task.employeeId)
    );

    setTitle(task.title);

    setDescription(
      task.description
    );

    setDueDate(task.dueDate);

    setPriority(task.priority);

    setStatus(task.status);
  }

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

  return (
    <div className="tasks-page">

      <h1>Tasks Management</h1>

      <p className="page-description">
        Assign and manage employee tasks.
      </p>

      <form
        className="tasks-form"
        onSubmit={handleSubmit}
      >

        {/* Employee */}

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

        {/* Task Title */}

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

        {/* Description */}

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

        {/* Due Date */}

        <input
          type="date"
          value={dueDate}
          onChange={(event) =>
            setDueDate(
              event.target.value
            )
          }
        />

        {/* Priority */}

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

        {/* Status */}

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

        {/* Submit */}

        <button type="submit">
          {editingId !== null
            ? "Update Task"
            : "Add Task"}
        </button>

        {/* Cancel */}

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

      {/* TASK LIST */}

      <div className="task-list">

        <h2>Task List</h2>

        {tasks.length === 0 ? (

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

              {tasks.map(
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