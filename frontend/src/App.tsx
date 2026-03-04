import "./index.css";
import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Account from "./pages/Account.jsx";
import AdminManage from "./pages/AdminManage.jsx";
import CustomerManage from "./pages/CustomerManage.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  // -------------------------
  // AUTH STATE (cookie-based)
  // -------------------------

  const [user, setUser] = useState<null | {
    username: string;
    role: "admin" | "customer";
  }>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const isLoggedIn = !!user;

  // -------------------------
  // CHECK AUTH ON APP LOAD
  // -------------------------

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setUser({
          username: data.username,
          role: data.role,
        });
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // -------------------------
  // ITEMS STATE
  // -------------------------

  const [items, setItems] = useState([]);
  const [itemsError, setItemsError] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("/api/items");
        if (!response.ok) throw new Error("Failed to load items.");

        const data = await response.json();

        const normalized = (data || []).map((item) => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          location: item.location,
          description: item.description,
          path: item.imagePath,
          averageRating: item.averageRating,
          reviewCount: item.reviewCount,
          sellCount: item.sellCount,
        }));

        console.log(normalized)

        setItems(normalized);
        setItemsError("");
      } catch (error: any) {
        setItemsError(error.message);
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadItems();
  }, []);

  // -------------------------
  // AUTH HANDLERS
  // -------------------------

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    navigate("/");
  };

  if (authLoading || isLoadingItems) {
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
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
        <Route path="/items/:itemId" element={<ItemDetail />} />


        <Route
          path="/account"
          element={
            isLoggedIn ? (
              <Account username={user.username} />
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
