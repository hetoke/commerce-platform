import Typewriter from "./Typewriter";

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-2xl border border-[#1f2937] bg-[#0f141b] px-6 py-8 text-center">
        <div className="text-2xl font-semibold text-slate-100">
          <Typewriter text="Loading" speed={40} />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Preparing your storefront…
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
