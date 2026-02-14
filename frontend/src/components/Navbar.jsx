import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

const Navbar = ({ isLoggedIn, onLogout }) => {
  return (
    <nav className="relative w-full h-14 px-6 flex items-center bg-[#0f141b] border-b border-[#1f2937]">
      {/* Left */}
      <div className="flex items-center gap-6">
        <span className="font-semibold text-lg text-slate-100">Hetoke Shop</span>
      </div>

      <ul className="absolute left-1/2 -translate-x-1/2 flex flex-row gap-8 list-none">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors ${
                isActive
                  ? "text-slate-100"
                  : "text-slate-400 hover:text-slate-100"
              }`
            }
          >
            Home
          </NavLink>
        </li>
        {isLoggedIn && (
          <li>
            <NavLink
              to="/manage"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-slate-100"
                    : "text-slate-400 hover:text-slate-100"
                }`
              }
            >
              Manage
            </NavLink>
          </li>
        )}
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `transition-colors ${
                isActive
                  ? "text-slate-100"
                  : "text-slate-400 hover:text-slate-100"
              }`
            }
          >
            About
          </NavLink>
        </li>
      </ul>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <NavLink to="/account" className="block">
              <img
                src="https://i.pravatar.cc/40"
                alt="Account"
                className="w-9 h-9 rounded-full cursor-pointer"
              />
            </NavLink>
            <button
              onClick={onLogout}
              className="rounded-full border border-[#2a3442] bg-[#141a22] px-3 py-1 text-xs font-semibold text-slate-200 hover:border-[#6f7cff] hover:bg-[#182130]"
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className="rounded-full border border-[#2a3442] bg-[#141a22] px-3 py-1 text-xs font-semibold text-slate-200 hover:border-[#6f7cff] hover:bg-[#182130]"
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

Navbar.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};
