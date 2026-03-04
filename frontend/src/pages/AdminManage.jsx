import React, { useState } from "react";
import Typewriter from "../components/Typewriter.jsx";
import PropTypes from "prop-types";
import { protectedFetch } from "../api/api.js"

const AdminManage = ({ items, setItems }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    location: "",
    description: "",
    detailedDescription: "",
    path: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      location: "",
      description: "",
      detailedDescription: "",
      path: "",
    });
    setEditingId(null);
    setError("");
    setIsUploading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || 
        !form.price || 
        !form.location || 
        !form.description) {
      setError("Please enter enough fields");
      return;
    }
    if (Number.isNaN(Number(form.price))) {
      setError("Price must be a number.");
      return;
    }
    const payload = {
      name: form.name,
      price: Number(form.price),
      location: form.location,
      description: form.description,
      detailedDescription: form.detailedDescription,
      path: form.path || undefined,
    };

    const request = async () => {
      const url = editingId ? `/api/items/${editingId}` : "/api/items";
      const method = editingId ? "PUT" : "POST";
      const response = await protectedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save item.");
      }

      
      const data = await response.json();

      const normalizedItem = {
        id: data._id || data.id,
        name: data.name,
        price: data.price,
        location: data.location,
        description: data.description,
        detailedDescription: data.detailedDescription, 
        path: data.path,
      };

      if (editingId) {
        // UPDATE existing item
        setItems(prev =>
          prev.map(item =>
            item.id === normalizedItem.id ? normalizedItem : item
          )
        );
      } else {
        // ADD new item
        setItems(prev => [...prev, normalizedItem]);
      }

      resetForm();
    };

    request().catch((err) => setError(err.message));
  };

  const handleEdit = async (item) => {
    const res = await protectedFetch(`/api/items/${item.id}`);
    const fullItem = await res.json();

    setEditingId(fullItem._id);

    setForm({
      name: fullItem.name,
      price: fullItem.price,
      location: fullItem.location,
      description: fullItem.description,
      detailedDescription: fullItem.detailedDescription || "",
      path: fullItem.path || "",
    });
  };

  const handleDelete = (id) => {
    const request = async () => {
      const response = await protectedFetch(`/api/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete item.");
      }
      await response.json(); // if backend sends { success: true }

      setItems(prev => prev.filter(item => item.id !== id));

      if (editingId === id) {
        resetForm();
      }
    };

    request().catch((err) => setError(err.message));
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold text-slate-100">
        <Typewriter text="Admin Panel" />
      </h1>
      <p className="mt-3 text-slate-400">
        <Typewriter
          text="Create, update, and remove shop items."
          speed={22}
          delay={250}
        />
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#1f2937] bg-[#0f141b] p-5"
        >
          <h2 className="text-lg font-semibold text-slate-100">
            {editingId ? "Edit item" : "Add new item"}
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-400">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
                placeholder="Product name"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-400">Price</span>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
                placeholder="99"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-400">
                Seller location
              </span>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
                placeholder="City, State"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-400">
                Description
              </span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-2 min-h-[96px] w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
                placeholder="Short product description"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-400">
                Product image
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setError("");
                  setIsUploading(true);
                  try {
                    const body = new FormData();
                    body.append("image", file);
                    const response = await protectedFetch("/api/uploads/image", {
                      method: "POST",
                      body,
                    });
                    if (!response.ok) {
                      const data = await response.json().catch(() => ({}));
                      throw new Error(data.message || "Image upload failed.");
                    }
                    const data = await response.json();
                    setForm((prev) => ({
                      ...prev,
                      path: data.path || "",
                    }));
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-300 focus:border-[#6f7cff] focus:outline-none file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-600"
              />
              {form.path ? (
                <p className="mt-2 text-xs text-slate-500">
                  Uploaded: {form.path}
                </p>
              ) : null}
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-full border border-[#2a3442] bg-[#141a22] px-4 py-2 text-xs font-semibold text-slate-200 hover:border-[#6f7cff] hover:bg-[#182130]"
            >
              {isUploading
                ? "Uploading..."
                : editingId
                  ? "Save changes"
                  : "Create item"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-transparent px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-[#1f2937] bg-[#0f141b] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">
              Current items
            </h2>
            <span className="text-xs text-slate-500">
              {items.length} total
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-[#1f2937] bg-[#101621] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-[#1a2330]">
                    {item.path ? (
                      <img
                        src={`/uploads/${item.path}`}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.location} •{" "}
                      {typeof item.price === "number"
                        ? `$${item.price}`
                        : item.price}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded-full border border-[#2a3442] bg-[#141a22] px-3 py-1 text-xs font-semibold text-slate-200 hover:border-[#6f7cff] hover:bg-[#182130]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-[#2a3442] px-3 py-1 text-xs font-semibold text-slate-400 hover:border-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-slate-400">
          Detailed Description
        </span>
        <textarea
          name="detailedDescription"
          value={form.detailedDescription}
          onChange={handleChange}
          className="mt-2 min-h-[220px] w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-3 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
          placeholder="Full product details, specs, condition, shipping info, etc..."
        />
      </label>

    </main>
  );
};

export default AdminManage;

AdminManage.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      location: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      detailedDescription: PropTypes.string,
      path: PropTypes.string,
    })
  ).isRequired,
  setItems: PropTypes.func.isRequired
};
