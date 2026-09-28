import { useState } from "react";
import "./Leave.css";

function Leave({ employees, leaves, setLeaves }) {
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("Pending");

  const [editingId, setEditingId] = useState(null);

  function clearForm() {
    setEmployeeId("");
    setLeaveType("Casual Leave");
    setFromDate("");
    setToDate("");
    setReason("");
    setStatus("Pending");
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !employeeId ||
      !fromDate ||
      !toDate ||
      !reason
    ) {
      alert("Please fill all fields");
      return;
    }

    if (toDate < fromDate) {
      alert("To date cannot be before From date");
      return;
    }

    const employee = employees.find(
      (item) => item.id === Number(employeeId)
    );

    if (!employee) {
      alert("Please select an employee");
      return;
    }

    if (editingId !== null) {
      setLeaves(
        leaves.map((leave) =>
          leave.id === editingId
            ? {
                ...leave,
                employeeId: employee.id,
                employeeName: employee.name,
                leaveType: leaveType,
                fromDate: fromDate,
                toDate: toDate,
                reason: reason,
                status: status,
              }
            : leave
        )
      );
    } else {
      const newLeave = {
        id: Date.now(),
        employeeId: employee.id,
        employeeName: employee.name,
        leaveType: leaveType,
        fromDate: fromDate,
        toDate: toDate,
        reason: reason,
        status: status,
      };

      setLeaves([
        ...leaves,
        newLeave,
      ]);
    }

    clearForm();
  }

  function handleEdit(leave) {
    setEditingId(leave.id);
    setEmployeeId(String(leave.employeeId));
    setLeaveType(leave.leaveType);
    setFromDate(leave.fromDate);
    setToDate(leave.toDate);
    setReason(leave.reason);
    setStatus(leave.status);
  }

  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this leave?"
    );

    if (confirmDelete) {
      setLeaves(
        leaves.filter(
          (leave) => leave.id !== id
        )
      );
    }
  }

  return (
    <div className="leave-page">

      <h1>Leave Management</h1>

      <p className="page-description">
        Manage employee leave requests.
      </p>

      <form
        className="leave-form"
        onSubmit={handleSubmit}
      >

        <select
          value={employeeId}
          onChange={(event) =>
            setEmployeeId(event.target.value)
          }
        >
          <option value="">
            Select Employee
          </option>

          {employees.map((employee) => (
            <option
              key={employee.id}
              value={employee.id}
            >
              {employee.name}
            </option>
          ))}
        </select>


        <select
          value={leaveType}
          onChange={(event) =>
            setLeaveType(event.target.value)
          }
        >
          <option value="Casual Leave">
            Casual Leave
          </option>

          <option value="Sick Leave">
            Sick Leave
          </option>

          <option value="Paid Leave">
            Paid Leave
          </option>

          <option value="Emergency Leave">
            Emergency Leave
          </option>
        </select>


        <input
          type="date"
          value={fromDate}
          onChange={(event) =>
            setFromDate(event.target.value)
          }
        />


        <input
          type="date"
          value={toDate}
          onChange={(event) =>
            setToDate(event.target.value)
          }
        />


        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
        />


        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="Pending">
            Pending
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>


        <button type="submit">
          {editingId !== null
            ? "Update Leave"
            : "Add Leave"}
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


      <div className="leave-list">

        <h2>Leave Requests</h2>

        {leaves.length === 0 ? (

          <p className="empty-message">
            No leave requests found.
          </p>

        ) : (

          <table>

            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {leaves.map((leave) => (

                <tr key={leave.id}>

                  <td>
                    {leave.employeeName}
                  </td>

                  <td>
                    {leave.leaveType}
                  </td>

                  <td>
                    {leave.fromDate}
                  </td>

                  <td>
                    {leave.toDate}
                  </td>

                  <td>
                    {leave.reason}
                  </td>

                  <td>
                    <span
                      className={
                        "leave-status " +
                        leave.status.toLowerCase()
                      }
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="actions">

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(leave)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(leave.id)
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

export default Leave;