import "./Dashboard.css";

function Dashboard({ employees, departments, attendance }) {

  const totalEmployees = employees.length;

  const totalDepartments = departments.length;

  const totalAttendance = attendance.length;

  const presentAttendance = attendance.filter(
    (record) => record.status === "Present"
  ).length;

  const attendancePercentage =
    totalAttendance === 0
      ? 0
      : Math.round(
          (presentAttendance / totalAttendance) * 100
        );

  const leaveCount = attendance.filter(
    (record) => record.status === "Leave"
  ).length;

  const departmentStats = departments.map(
    (department) => {

      const count = employees.filter(
        (employee) =>
          employee.department === department.name
      ).length;

      return {
        name: department.name,
        employees: count,
      };
    }
  );

  const recentEmployees = [...employees]
    .reverse()
    .slice(0, 5);

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      description: "Active employees",
      icon: "👥",
    },
    {
      title: "Departments",
      value: totalDepartments,
      description: "Active departments",
      icon: "🏢",
    },
    {
      title: "Attendance",
      value: `${attendancePercentage}%`,
      description: "Based on attendance records",
      icon: "📊",
    },
    {
      title: "On Leave",
      value: leaveCount,
      description: "Currently on leave",
      icon: "🌴",
    },
  ];

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back, Admin. Here's what's happening
            with your organization.
          </p>
        </div>

        <button className="add-employee-btn">
          + Add Employee
        </button>

      </div>


      <div className="stats-grid">

        {stats.map((stat) => (

          <div
            className="stat-card"
            key={stat.title}
          >

            <div className="stat-top">

              <span className="stat-icon">
                {stat.icon}
              </span>

              <span className="stat-title">
                {stat.title}
              </span>

            </div>

            <h2>{stat.value}</h2>

            <p>{stat.description}</p>

          </div>

        ))}

      </div>


      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Department Overview</h2>
              <p>Employees by department</p>
            </div>

          </div>

          <div className="department-list">

            {departmentStats.map(
              (department) => (

                <div
                  className="department-row"
                  key={department.name}
                >

                  <div className="department-info">

                    <span>
                      {department.name}
                    </span>

                    <strong>
                      {department.employees}
                    </strong>

                  </div>

                  <div className="progress-bar">

                    <div
                      className="progress"
                      style={{
                        width: `${Math.min(
                          department.employees * 10,
                          100
                        )}%`,
                      }}
                    ></div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>


        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Recent Employees</h2>
              <p>Recently added employees</p>
            </div>

          </div>

          <div className="recent-employees">

            {recentEmployees.length === 0 ? (

              <p className="empty-message">
                No employees found.
              </p>

            ) : (

              recentEmployees.map(
                (employee) => (

                  <div
                    className="employee-item"
                    key={employee.id}
                  >

                    <div className="employee-avatar">
                      {employee.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="employee-info">

                      <strong>
                        {employee.name}
                      </strong>

                      <span>
                        {employee.position}
                      </span>

                    </div>

                    <span className="employee-department">
                      {employee.department}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>


      <div className="quick-actions">

        <h2>Quick Actions</h2>

        <div className="quick-action-grid">

          <button>
            👤 Add Employee
          </button>

          <button>
            🏢 Manage Departments
          </button>

          <button>
            📅 View Attendance
          </button>

          <button>
            📄 Generate Report
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;