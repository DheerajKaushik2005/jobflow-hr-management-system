import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";

function App() {
  return (
    <div className="app">

      <Sidebar />

      <div className="main-area">

        <Navbar />

        <main className="content">

          <Routes>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/employees"
              element={<Employees />}
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}

export default App;