import { useState } from "react";
import "./Onboarding.css";

function Onboarding({
  employees,
  onboarding,
  setOnboarding,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [onboardingStatus, setOnboardingStatus] =
    useState("Pending");
  const [documentsStatus, setDocumentsStatus] =
    useState("Pending");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [documentsFilter, setDocumentsFilter] =
    useState("All");

  // Add / Update
  function handleSubmit(event) {
    event.preventDefault();

    if (
      !employeeId ||
      !joiningDate ||
      !notes
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

    if (editingId !== null) {
      setOnboarding(
        onboarding.map((record) =>
          record.id === editingId
            ? {
                ...record,
                employeeId: employee.id,
                employeeName: employee.name,
                joiningDate: joiningDate,
                onboardingStatus:
                  onboardingStatus,
                documentsStatus:
                  documentsStatus,
                notes: notes,
              }
            : record
        )
      );

      clearForm();
      return;
    }

    const newRecord = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      joiningDate: joiningDate,
      onboardingStatus:
        onboardingStatus,
      documentsStatus:
        documentsStatus,
      notes: notes,
    };

    setOnboarding([
      ...onboarding,
      newRecord,
    ]);

    clearForm();
  }

  function clearForm() {
    setEmployeeId("");
    setJoiningDate("");
    setOnboardingStatus("Pending");
    setDocumentsStatus("Pending");
    setNotes("");
    setEditingId(null);
  }

  function handleEdit(record) {
    setEditingId(record.id);

    setEmployeeId(
      String(record.employeeId)
    );

    setJoiningDate(
      record.joiningDate
    );

    setOnboardingStatus(
      record.onboardingStatus
    );

    setDocumentsStatus(
      record.documentsStatus
    );

    setNotes(record.notes);
  }

  function handleDelete(id) {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this onboarding record?"
      );

    if (confirmDelete) {
      setOnboarding(
        onboarding.filter(
          (record) =>
            record.id !== id
        )
      );
    }
  }

  // Summary

  const totalOnboarding =
    onboarding.length;

  const pendingOnboarding =
    onboarding.filter(
      (record) =>
        record.onboardingStatus ===
        "Pending"
    ).length;

  const inProgressOnboarding =
    onboarding.filter(
      (record) =>
        record.onboardingStatus ===
        "In Progress"
    ).length;

  const completedOnboarding =
    onboarding.filter(
      (record) =>
        record.onboardingStatus ===
        "Completed"
    ).length;

  // Search + Filters

  const filteredOnboarding =
    onboarding.filter((record) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        record.employeeName
          .toLowerCase()
          .includes(searchText) ||
        record.notes
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        record.onboardingStatus ===
          statusFilter;

      const matchesDocuments =
        documentsFilter === "All" ||
        record.documentsStatus ===
          documentsFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDocuments
      );
    });

  return (
    <div className="onboarding-page">

      <h1>Employee Onboarding</h1>

      <p className="page-description">
        Manage employee onboarding and joining
        information.
      </p>

      {/* SUMMARY CARDS */}

      <div className="onboarding-summary">

        <div className="onboarding-summary-card">
          <span>
            Total Onboarding
          </span>

          <strong>
            {totalOnboarding}
          </strong>
        </div>

        <div className="onboarding-summary-card">
          <span>
            Pending
          </span>

          <strong>
            {pendingOnboarding}
          </strong>
        </div>

        <div className="onboarding-summary-card">
          <span>
            In Progress
          </span>

          <strong>
            {inProgressOnboarding}
          </strong>
        </div>

        <div className="onboarding-summary-card">
          <span>
            Completed
          </span>

          <strong>
            {completedOnboarding}
          </strong>
        </div>

      </div>

      {/* FORM */}

      <form
        className="onboarding-form"
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
          type="date"
          value={joiningDate}
          onChange={(event) =>
            setJoiningDate(
              event.target.value
            )
          }
        />

        <select
          value={onboardingStatus}
          onChange={(event) =>
            setOnboardingStatus(
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

        <select
          value={documentsStatus}
          onChange={(event) =>
            setDocumentsStatus(
              event.target.value
            )
          }
        >
          <option value="Pending">
            Documents Pending
          </option>

          <option value="Submitted">
            Documents Submitted
          </option>

          <option value="Verified">
            Documents Verified
          </option>
        </select>

        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
        />

        <button type="submit">
          {editingId !== null
            ? "Update Onboarding"
            : "Add Onboarding"}
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

      {/* SEARCH + FILTERS */}

      <div className="onboarding-controls">

        <div className="onboarding-search">
          <input
            type="text"
            placeholder="🔍 Search employee or notes..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="onboarding-filter">

          <label>
            Onboarding Status
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

        <div className="onboarding-filter">

          <label>
            Documents
          </label>

          <select
            value={documentsFilter}
            onChange={(event) =>
              setDocumentsFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Documents
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Submitted">
              Submitted
            </option>

            <option value="Verified">
              Verified
            </option>

          </select>

        </div>

      </div>

      {/* LIST */}

      <div className="onboarding-list">

        <h2>
          Onboarding Records
        </h2>

        {filteredOnboarding.length ===
        0 ? (

          <p className="empty-message">
            No onboarding records found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Joining Date
                </th>

                <th>
                  Onboarding
                </th>

                <th>
                  Documents
                </th>

                <th>
                  Notes
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredOnboarding.map(
                (record) => (

                  <tr
                    key={record.id}
                  >

                    <td>
                      {record.employeeName}
                    </td>

                    <td>
                      {record.joiningDate}
                    </td>

                    <td>

                      <span
                        className={
                          "onboarding-status " +
                          record.onboardingStatus
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )
                        }
                      >
                        {
                          record.onboardingStatus
                        }
                      </span>

                    </td>

                    <td>

                      <span
                        className={
                          "documents-status " +
                          record.documentsStatus
                            .toLowerCase()
                        }
                      >
                        {
                          record.documentsStatus
                        }
                      </span>

                    </td>

                    <td>
                      {record.notes}
                    </td>

                    <td className="actions">

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            record
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
                            record.id
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

export default Onboarding;