function Dashboard() {
  const stats = [
    {
      title: "Total Employees",
      value: "24",
      description: "Active employees",
      icon: "👥",
    },
    {
      title: "Departments",
      value: "6",
      description: "Active departments",
      icon: "🏢",
    },
    {
      title: "Attendance",
      value: "92%",
      description: "This month",
      icon: "📊",
    },
    {
      title: "On Leave",
      value: "3",
      description: "Currently on leave",
      icon: "🌴",
    },
  ];

  const departments = [
    { name: "Engineering", employees: 8 },
    { name: "Marketing", employees: 6 },
    { name: "Human Resources", employees: 4 },
    { name: "Finance", employees: 3 },
    { name: "Sales", employees: 3 },
  ];

  const recentEmployees = [
    {
      name: "Rahul Sharma",
      department: "Engineering",
      position: "Frontend Developer",
    },
    {
      name: "Priya Singh",
      department: "HR",
      position: "HR Executive",
    },
    {
      name: "Aman Kumar",
      department: "Marketing",
      position: "Marketing Executive",
    },
    {
      name: "Neha Verma",
      department: "Finance",
      position: "Accountant",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
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

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-top">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-title">
                {stat.title}
              </span>
            </div>

            <h2>{stat.value}</h2>

            <p>{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-grid">

        {/* Department Overview */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Department Overview</h2>
              <p>Employees by department</p>
            </div>
          </div>

          <div className="department-list">
            {departments.map((department) => (
              <div
                className="department-row"
                key={department.name}
              >
                <div className="department-info">
                  <span>{department.name}</span>
                  <strong>{department.employees}</strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{
                      width: `${department.employees * 10}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Recent Employees</h2>
              <p>Recently added employees</p>
            </div>
          </div>

          <div className="recent-employees">
            {recentEmployees.map((employee) => (
              <div
                className="employee-item"
                key={employee.name}
              >
                <div className="employee-avatar">
                  {employee.name.charAt(0)}
                </div>

                <div className="employee-info">
                  <strong>{employee.name}</strong>
                  <span>
                    {employee.position}
                  </span>
                </div>

                <span className="employee-department">
                  {employee.department}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Actions */}
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