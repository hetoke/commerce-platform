import React, { useEffect } from "react";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div
      className={`fixed top-20 right-6 px-4 py-2 rounded shadow-lg text-white ${bgColor} z-50`}
    >
      {message}
    </div>
  );
};

export default Toast;