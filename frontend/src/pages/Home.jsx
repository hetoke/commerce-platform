import React, { useState } from "react";
import PropTypes from "prop-types";
import ItemCard from "../components/ItemCard.jsx";
import Typewriter from "../components/Typewriter.jsx";
import Toast from "../components/Toast.jsx";

const Home = ({ items, error }) => {
  //console.log(items)
  const [toast, setToast] = useState(null);
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}  
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100">
          <Typewriter text="Featured items" />
        </h1>
        <p className="mt-2 text-slate-400">
          <Typewriter
            text="Handpicked pieces, chosen for quality and style."
            speed={22}
            delay={250}
          />
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="fade-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ItemCard 
                item={item} 
                onToast={setToast}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Home;

Home.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      location: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ).isRequired,
  error: PropTypes.string,
};
