import React, { useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include", // 🔥 REQUIRED
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Signup failed.");
      }

      // Option A: backend returns user directly
      const data = await response.json();

      setUser(data.user);
      navigate("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-16 pt-12">
      <div className="rounded-2xl border border-[#1f2937] bg-[#0f141b] p-6">
        <h1 className="text-2xl font-semibold text-slate-100">
          Create account
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          New customers start here.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={isLoading}
          className="mt-6 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-4 py-2 text-sm font-semibold text-slate-100 hover:border-[#6f7cff] hover:bg-[#182130] disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Sign up"}
        </button>

        <p className="mt-4 text-sm text-slate-400">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-slate-200 hover:text-white"
          >
            Log in
          </NavLink>
        </p>
      </div>
    </main>
  );
};

export default Signup;
