import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        JobFlow
      </div>

      <nav>

        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/employees">
          Employees
        </NavLink>

        <NavLink to="/departments">
          Departments
        </NavLink>

        <NavLink to="/attendance">
          Attendance
        </NavLink>

        <NavLink to="/leave">
          Leave
        </NavLink>

        <NavLink to="/tasks">
          Tasks
        </NavLink>

        <NavLink to="/onboarding">
          Onboarding
        </NavLink>

        <NavLink to="/reports">
          Reports
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;