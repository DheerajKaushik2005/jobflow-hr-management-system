import { useState } from "react";

function Employees() {
  // All employees
  const [employees, setEmployees] = useState([]);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  // Stores the employee currently being edited
  const [editingId, setEditingId] = useState(null);

  // CREATE / UPDATE
  function handleSubmit(event) {
    event.preventDefault();

    // Basic validation
    if (!name || !email || !department || !position) {
      alert("Please fill all fields");
      return;
    }

    // If editingId exists → UPDATE
    if (editingId !== null) {
      setEmployees(
        employees.map((employee) =>
          employee.id === editingId
            ? {
                ...employee,
                name: name,
                email: email,
                department: department,
                position: position,
              }
            : employee
        )
      );

      // Exit edit mode
      setEditingId(null);
    } else {
      // Otherwise → CREATE
      const newEmployee = {
        id: Date.now(),
        name: name,
        email: email,
        department: department,
        position: position,
      };

      setEmployees([...employees, newEmployee]);
    }

    clearForm();
  }

  // Clear form
  function clearForm() {
    setName("");
    setEmail("");
    setDepartment("");
    setPosition("");
  }

  // EDIT
  function handleEdit(employee) {
    setEditingId(employee.id);

    setName(employee.name);
    setEmail(employee.email);
    setDepartment(employee.department);
    setPosition(employee.position);
  }

  // DELETE
  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (confirmDelete) {
      setEmployees(
        employees.filter((employee) => employee.id !== id)
      );
    }
  }

  return (
    <div className="employees-page">

      <h1>Employees</h1>

      {/* =========================
          EMPLOYEE FORM
      ========================= */}

      <form
        className="employee-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(event) =>
            setDepartment(event.target.value)
          }
        />

        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(event) =>
            setPosition(event.target.value)
          }
        />

        {/* Button changes depending on mode */}

        <button type="submit">
          {editingId !== null
            ? "Update Employee"
            : "Add Employee"}
        </button>

        {/* Cancel editing */}

        {editingId !== null && (
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setEditingId(null);
              clearForm();
            }}
          >
            Cancel
          </button>
        )}

      </form>

      {/* =========================
          EMPLOYEE LIST
      ========================= */}

      <div className="employee-list">

        <h2>Employee List</h2>

        {employees.length === 0 ? (

          <p className="empty-message">
            No employees added yet.
          </p>

        ) : (

          <table>

            <thead>

              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {employees.map((employee) => (

                <tr key={employee.id}>

                  <td>{employee.name}</td>

                  <td>{employee.email}</td>

                  <td>{employee.department}</td>

                  <td>{employee.position}</td>

                  <td className="actions">

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEdit(employee)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default Employees;