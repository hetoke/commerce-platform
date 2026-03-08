import React, { useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";
import { publicFetch } from "../api/api.js"



const Login = () => {

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await publicFetch("/api/auth/login", {
        method: "POST",
        credentials: "include", // 🔥 IMPORTANT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Login failed.");
      }

      const data = await response.json();
      setUser(data.user);
      navigate("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");

      const res = await publicFetch("/api/auth/google", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Google login failed.");
      }

      const data = await res.json();
      //console.log(data.user)
      setUser(data.user);
      navigate("/");

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

        <div className="mt-4">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-[#2a3442]" />
            <span className="mx-3 text-xs text-slate-400">OR</span>
            <div className="flex-grow border-t border-[#2a3442]" />
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed.")}
              theme="filled_black"
              size="large"
            />
          </div>
        </div>

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


