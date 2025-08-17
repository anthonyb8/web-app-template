import { NavLink } from "react-router-dom";
import "./SideBar.css";

export default function SideBar() {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="dashboard">Dashboard</NavLink>
        </li>
        <li name="button-to-account">
          <NavLink to="account">Account</NavLink>
        </li>
      </ul>
    </nav>
  );
}
