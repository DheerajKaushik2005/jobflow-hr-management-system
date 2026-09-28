import { useState } from "react";
import "./Attendance.css";

function Attendance({
  employees,
  attendance,
  setAttendance,
  leaves,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Present");

  const [editingId, setEditingId] = useState(null);

  /*
    Find the latest leave request for the
    selected employee and selected date.

    Because IDs are created using Date.now(),
    the larger ID represents the newer request.
  */

  function getLatestLeave(employeeIdValue, selectedDate) {
    if (!employeeIdValue || !selectedDate) {
      return null;
    }

    const matchingLeaves = leaves
      .filter(
        (leave) =>
          leave.employeeId === Number(employeeIdValue) &&
          selectedDate >= leave.fromDate &&
          selectedDate <= leave.toDate
      )
      .sort((a, b) => b.id - a.id);

    return matchingLeaves[0] || null;
  }


  /*
    Check latest leave status.
  */

  const latestLeave = getLatestLeave(
    employeeId,
    date
  );

  const approvedLeaveExists =
    latestLeave?.status === "Approved";


  /*
    Employee change
  */

  function handleEmployeeChange(event) {
    const selectedId = event.target.value;

    setEmployeeId(selectedId);

    const latestLeaveForEmployee =
      getLatestLeave(
        selectedId,
        date
      );

    if (
      latestLeaveForEmployee?.status ===
      "Approved"
    ) {
      setStatus("Leave");
    } else {
      setStatus("Present");
    }
  }


  /*
    Date change
  */

  function handleDateChange(event) {
    const selectedDate = event.target.value;

    setDate(selectedDate);

    const latestLeaveForDate =
      getLatestLeave(
        employeeId,
        selectedDate
      );

    if (
      latestLeaveForDate?.status ===
      "Approved"
    ) {
      setStatus("Leave");
    } else {
      setStatus("Present");
    }
  }


  /*
    Submit attendance
  */

  function handleSubmit(event) {
    event.preventDefault();

    if (!employeeId || !date || !status) {
      alert("Please fill all fields");
      return;
    }


    /*
      Re-check the latest leave before saving.
      This prevents manually adding Leave
      without an approved leave.
    */

    const currentLatestLeave =
      getLatestLeave(
        employeeId,
        date
      );

    const canUseLeave =
      currentLatestLeave?.status ===
      "Approved";


    if (
      status === "Leave" &&
      !canUseLeave
    ) {
      alert(
        "Leave is only available when the latest leave request is approved."
      );

      setStatus("Present");

      return;
    }


    /*
      Find employee
    */

    const selectedEmployee =
      employees.find(
        (employee) =>
          employee.id === Number(employeeId)
      );


    if (!selectedEmployee) {
      alert("Employee not found");
      return;
    }


    /*
      Update existing attendance
    */

    if (editingId !== null) {
      setAttendance(
        attendance.map((record) =>
          record.id === editingId
            ? {
                ...record,
                employeeId:
                  selectedEmployee.id,
                employeeName:
                  selectedEmployee.name,
                date: date,
                status: status,
              }
            : record
        )
      );

      clearForm();

      return;
    }


    /*
      Add new attendance
    */

    const newAttendance = {
      id: Date.now(),
      employeeId:
        selectedEmployee.id,
      employeeName:
        selectedEmployee.name,
      date: date,
      status: status,
    };

    setAttendance([
      ...attendance,
      newAttendance,
    ]);

    clearForm();
  }


  /*
    Clear form
  */

  function clearForm() {
    setEmployeeId("");
    setDate("");
    setStatus("Present");
    setEditingId(null);
  }


  /*
    Edit attendance
  */

  function handleEdit(record) {
    setEditingId(record.id);

    setEmployeeId(
      String(record.employeeId)
    );

    setDate(record.date);

    setStatus(record.status);
  }


  /*
    Delete attendance
  */

  function handleDelete(id) {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this attendance record?"
      );

    if (confirmDelete) {
      setAttendance(
        attendance.filter(
          (record) =>
            record.id !== id
        )
      );
    }
  }


  /*
    Cancel editing
  */

  function handleCancel() {
    clearForm();
  }


  return (
    <div className="attendance-page">

      <h1>Attendance</h1>

      <p className="page-description">
        Manage employee attendance records.
      </p>


      {/* Attendance Form */}

      <form
        className="attendance-form"
        onSubmit={handleSubmit}
      >

        {/* Employee */}

        <select
          value={employeeId}
          onChange={
            handleEmployeeChange
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


        {/* Date */}

        <input
          type="date"
          value={date}
          onChange={
            handleDateChange
          }
        />


        {/* Status */}

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >

          <option value="Present">
            Present
          </option>

          <option value="Absent">
            Absent
          </option>

          {/* Leave appears ONLY when
              latest leave is approved */}

          {approvedLeaveExists && (
            <option value="Leave">
              Leave
            </option>
          )}

        </select>


        {/* Submit */}

        <button type="submit">
          {editingId !== null
            ? "Update Attendance"
            : "Add Attendance"}
        </button>


        {/* Cancel */}

        {editingId !== null && (
          <button
            type="button"
            className="cancel-button"
            onClick={
              handleCancel
            }
          >
            Cancel
          </button>
        )}

      </form>


      {/* Attendance List */}

      <div className="attendance-list">

        <h2>
          Attendance Records
        </h2>


        {attendance.length === 0 ? (

          <p className="empty-message">
            No attendance records found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Date
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

              {attendance.map(
                (record) => (

                  <tr
                    key={record.id}
                  >

                    <td>
                      {record.employeeName}
                    </td>

                    <td>
                      {record.date}
                    </td>

                    <td>

                      <span
                        className={
                          `attendance-status ${record.status.toLowerCase()}`
                        }
                      >
                        {record.status}
                      </span>

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

export default Attendance;