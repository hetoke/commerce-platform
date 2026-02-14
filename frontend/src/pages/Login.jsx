import React, { useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include", // 🔥 IMPORTANT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Login failed.");
      }

      // 🔥 Now fetch authenticated user info
      const meRes = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!meRes.ok) {
        throw new Error("Failed to fetch user.");
      }

      const user = await meRes.json();

      onLogin({
        username: user.username,
        role: user.role,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-16 pt-12">
      <div className="rounded-2xl border border-[#1f2937] bg-[#0f141b] p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Login</h1>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="mt-6 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-4 py-2 text-sm font-semibold text-slate-100 hover:border-[#6f7cff] hover:bg-[#182130] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-sm text-slate-400">
          New here?{" "}
          <NavLink
            to="/signup"
            className="text-slate-200 hover:text-white"
          >
            Create an account
          </NavLink>
        </p>
      </div>
    </main>
  );
};

export default Login;

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
