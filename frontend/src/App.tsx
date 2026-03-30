import "./index.css";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import AdminManage from "./pages/AdminManage";
import CustomerManage from "./pages/CustomerManage";
import ItemDetail from "./pages/ItemDetail";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { publicFetch } from "./api/api";
import type { Item } from "./types";

function App() {
  const navigate = useNavigate();

  const { user, authLoading, setUser } = useAuth();
  const isLoggedIn = !!user;


  // -------------------------
  // ITEMS STATE
  // -------------------------

  const [items, setItems] = useState<Item[]>([]);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await publicFetch("/api/items");
        if (!response.ok) throw new Error("Failed to load items.");

        const data = (await response.json()) as Array<Record<string, unknown>>;

        const normalized = (data || []).map((item) => ({
          id: String(item._id || item.id || ""),
          name: String(item.name || ""),
          price: item.price as Item["price"],
          location: String(item.location || ""),
          description: String(item.description || ""),
          path: typeof item.imagePath === "string" ? item.imagePath : undefined,
          averageRating:
            typeof item.averageRating === "number" ? item.averageRating : undefined,
          reviewCount:
            typeof item.reviewCount === "number" ? item.reviewCount : undefined,
          sellCount:
            typeof item.sellCount === "number" ? item.sellCount : undefined,
        }));

        setItems(normalized);
        setItemsError("");
      } catch (error) {
        setItemsError(
          error instanceof Error ? error.message : "Failed to load items.",
        );
      }
    };

    void loadItems();
  }, []);


  const handleLogout = async () => {
    await publicFetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    navigate("/");
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home items={items} error={itemsError} />} />

        <Route
          path="/manage"
          element={
            !isLoggedIn ? (
              <Navigate to="/login" replace />
            ) : user.role === "admin" ? (
              <AdminManage items={items} setItems={setItems} />
            ) : (
              <CustomerManage />
            )
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/items/:itemId" element={<ItemDetail />} />


        <Route
          path="/account"
          element={
            isLoggedIn ? (
              <Account />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
