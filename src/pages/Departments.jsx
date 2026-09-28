import { useState } from "react";
import "./Departments.css";

function Departments({ departments, setDepartments }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    if (!name || !description) {
      alert("Please fill all fields");
      return;
    }

    if (editingId !== null) {
      setDepartments(
        departments.map((department) =>
          department.id === editingId
            ? {
                ...department,
                name: name,
                description: description,
              }
            : department
        )
      );

      setEditingId(null);
    } else {
      const newDepartment = {
        id: Date.now(),
        name: name,
        description: description,
      };

      setDepartments([
        ...departments,
        newDepartment,
      ]);
    }

    clearForm();
  }

  function clearForm() {
    setName("");
    setDescription("");
  }

  function handleEdit(department) {
    setEditingId(department.id);
    setName(department.name);
    setDescription(department.description);
  }

  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (confirmDelete) {
      setDepartments(
        departments.filter(
          (department) => department.id !== id
        )
      );
    }
  }

  function handleCancel() {
    setEditingId(null);
    clearForm();
  }

  return (
    <div className="departments-page">

      <h1>Departments</h1>

      <p className="page-description">
        Manage your organization's departments.
      </p>

      <form
        className="department-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          placeholder="Department Name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />

        <button type="submit">
          {editingId !== null
            ? "Update Department"
            : "+ Add Department"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}

      </form>

      <div className="department-list-page">

        <h2>Department List</h2>

        {departments.length === 0 ? (
          <p className="empty-message">
            No departments found.
          </p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {departments.map((department) => (
                <tr key={department.id}>

                  <td>
                    {department.name}
                  </td>

                  <td>
                    {department.description}
                  </td>

                  <td className="actions">

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(department)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(department.id)
                      }
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

export default Departments;