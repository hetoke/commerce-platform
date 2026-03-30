import { useState, useEffect } from "react";
import { protectedFetch } from "../api/api";
import { useAuth } from "../context/AuthContext";

function Account() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newUsername, setNewUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      setMessage("Username cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await protectedFetch("/api/account/update-username", {
        method: "PUT",
        body: JSON.stringify({ newUsername }),
      });

      if (!res.ok) throw new Error("Failed to update username");

      setUser((prev) =>
        prev ? { ...prev, username: newUsername } : prev,
      );
      setUsername(newUsername);
      setNewUsername("");
      setMessage("Username updated successfully.");

    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await protectedFetch("/api/account/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) throw new Error("Failed to change password");

      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold text-slate-100">
        Account management
      </h1>

      <div className="mt-8 grid gap-6">
        {/* Profile Section */}
        <section className="rounded-2xl border border-[#1f2937] bg-[#0f141b] p-5">
          <h2 className="text-lg font-semibold text-slate-100">Profile</h2>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Email</p>
            <p className="mt-1 text-sm text-slate-100">{email || "—"}</p>
          </div>
          
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Username</p>
            <p className="mt-1 text-sm text-slate-100">{username || "—"}</p>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username"
                disabled={loading}
                className="flex-1 rounded-lg border border-[#1f2937] bg-[#1a1f28] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />

              <button
                onClick={updateUsername}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="rounded-2xl border border-[#1f2937] bg-[#0f141b] p-5">
          <h2 className="text-lg font-semibold text-slate-100">Security</h2>

          <form onSubmit={changePassword} className="grid gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-[#1f2937] bg-[#1a1f28] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-[#1f2937] bg-[#1a1f28] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>

        {message && (
          <p className="text-sm text-center text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}

export default Account;
