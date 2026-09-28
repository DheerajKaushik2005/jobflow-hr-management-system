import { useState } from "react";
import "./Emp.css";

function Employees({
  employees,
  setEmployees,
  departments,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  /* =========================
     ADD / UPDATE EMPLOYEE
  ========================= */

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !name ||
      !email ||
      !department ||
      !position
    ) {
      alert("Please fill all fields");
      return;
    }

    /* UPDATE */

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

      setEditingId(null);
    }

    /* ADD */

    else {
      const newEmployee = {
        id: Date.now(),
        name: name,
        email: email,
        department: department,
        position: position,
      };

      setEmployees([
        ...employees,
        newEmployee,
      ]);
    }

    clearForm();
  }


  /* =========================
     CLEAR FORM
  ========================= */

  function clearForm() {
    setName("");
    setEmail("");
    setDepartment("");
    setPosition("");
  }


  /* =========================
     EDIT EMPLOYEE
  ========================= */

  function handleEdit(employee) {
    setEditingId(employee.id);

    setName(employee.name);
    setEmail(employee.email);
    setDepartment(employee.department);
    setPosition(employee.position);
  }


  /* =========================
     DELETE EMPLOYEE
  ========================= */

  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (confirmDelete) {
      setEmployees(
        employees.filter(
          (employee) => employee.id !== id
        )
      );
    }
  }


  /* =========================
     FILTER EMPLOYEES
  ========================= */

  const filteredEmployees =
    employees.filter((employee) => {

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        employee.name
          .toLowerCase()
          .includes(searchText) ||

        employee.email
          .toLowerCase()
          .includes(searchText) ||

        employee.department
          .toLowerCase()
          .includes(searchText) ||

        employee.position
          .toLowerCase()
          .includes(searchText);

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department ===
          departmentFilter;

      return (
        matchesSearch &&
        matchesDepartment
      );
    });


  return (
    <div className="employees-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <h1>Employees</h1>


      {/* =========================
          EMPLOYEE FORM
      ========================= */}

      <form
        className="employee-form"
        onSubmit={handleSubmit}
      >

        {/* NAME */}

        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />


        {/* EMAIL */}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />


        {/* DEPARTMENT */}

        <select
          value={department}
          onChange={(event) =>
            setDepartment(event.target.value)
          }
        >

          <option value="">
            Select Department
          </option>

          {departments.map((item) => (
            <option
              key={item.id}
              value={item.name}
            >
              {item.name}
            </option>
          ))}

        </select>


        {/* POSITION */}

        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(event) =>
            setPosition(event.target.value)
          }
        />


        {/* SUBMIT BUTTON */}

        <button type="submit">
          {editingId !== null
            ? "Update Employee"
            : "Add Employee"}
        </button>


        {/* CANCEL */}

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
          SEARCH + FILTER
      ========================= */}

      <div className="employee-controls">

        {/* SEARCH */}

        <div className="employee-search">

          <input
            type="text"
            placeholder="🔍 Search by name, email, department or position..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        {/* DEPARTMENT FILTER */}

        <div className="department-filter">

          <label htmlFor="departmentFilter">
            Department
          </label>

          <select
            id="departmentFilter"
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Departments
            </option>

            {departments.map((item) => (
              <option
                key={item.id}
                value={item.name}
              >
                {item.name}
              </option>
            ))}

          </select>

        </div>

      </div>


      {/* =========================
          EMPLOYEE LIST
      ========================= */}

      <div className="employee-list">

        <h2>Employee List</h2>


        {filteredEmployees.length === 0 ? (

          <p className="empty-message">
            No employees found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Department
                </th>

                <th>
                  Position
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredEmployees.map(
                (employee) => (

                  <tr
                    key={employee.id}
                  >

                    <td>
                      {employee.name}
                    </td>

                    <td>
                      {employee.email}
                    </td>

                    <td>
                      {employee.department}
                    </td>

                    <td>
                      {employee.position}
                    </td>

                    <td className="actions">

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            employee
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
                            employee.id
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

export default Employees;