// Navbar.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LOGO from "./Images/logo.png";
import { List, XLg } from "react-bootstrap-icons";
import "./Navbar.css";
import BackToDonate from "../back/BackToDonate";
import { NavLink } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const menuIcon = showMenu ? (
    <XLg className="HiMenu" onClick={toggleMenu} />
  ) : (
    <List className="HiMenu" onClick={toggleMenu} />
  );

  return (
    <>
      <nav>
        <Link to="/" onClick={closeMenu} className="logo">
          <div className="logoImg">
            <img src={LOGO} alt="GYWS_Logo" />
          </div>
          <div>Gopali Youth Welfare Society</div>
        </Link>

        {location.pathname === "/donate/each" ||
        location.pathname === "/donate/hostel_construction" ||
        location.pathname === "/donate/hostel_sustainability" ? (
          <BackToDonate />
        ) : (
          <div
            className={`menu-toggle ${showMenu ? "open" : ""}`}
            onClick={toggleMenu}
          >
            {menuIcon}
          </div>
        )}

        <ul className={`nav-links ${showMenu ? "show" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
            onClick={closeMenu}
          >
            <li>Home</li>
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
            onClick={closeMenu}
          >
            <li>About Us</li>
          </NavLink>
          <NavLink
            to="/jvm"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
            onClick={closeMenu}
          >
            <li>Initiatives</li>
          </NavLink>
          <NavLink
            to="/media"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
            onClick={closeMenu}
          >
            <li>Media</li>
          </NavLink>
          <NavLink
            to="/member"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
            onClick={closeMenu}
          >
            <li>Members</li>
          </NavLink>
          <NavLink to="/donate" id="donatebtn" onClick={closeMenu}>
            <li>Donate</li>
          </NavLink>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
