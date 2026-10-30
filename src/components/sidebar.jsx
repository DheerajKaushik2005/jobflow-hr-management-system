import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Employees",
      path: "/employees",
      icon: "♙",
    },
    {
      name: "Departments",
      path: "/departments",
      icon: "▤",
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: "✓",
    },
    {
      name: "Leave",
      path: "/leave",
      icon: "▣",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: "☑",
    },
    {
      name: "Onboarding",
      path: "/onboarding",
      icon: "♙",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "▥",
    },
  ];

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">
        JobFlow
      </div>

      {/* MENU */}
      <nav className="sidebar-nav">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span className="sidebar-text">
              {item.name}
            </span>
          </NavLink>
        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;