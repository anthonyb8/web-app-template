// layouts/MainLayout.js
import SideBar from "../components/navigation/SideBar";
import "./MainLayout.css";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="dashboard-layout">
      <header className="top-bar">
        <h1>Worklog</h1>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <SideBar />
        </aside>

        <section className="content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
