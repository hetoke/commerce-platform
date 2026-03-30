import Typewriter from "../components/Typewriter";

const About = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold text-slate-100">
        <Typewriter text="About" />
      </h1>
      <p className="mt-3 text-slate-400">
        <Typewriter
          text="A user-friendly e-commerce platform built by Huynh Nhat Huy, designed to make shopping, reviewing, and purchasing products effortless and enjoyable. Perfectly tailored for small businesses and content creators."
          speed={10}
          delay={250}
        />
      </p>
      <div className="mt-6 flex items-center gap-5">
        <a
          href="https://www.facebook.com/hetoke32/"
          aria-label="Facebook"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2a3442] bg-[#141a22] text-slate-200 hover:border-[#6f7cff] hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M13.2 9.6V7.8c0-.8.5-1 1.1-1h1.6V4h-2.2c-2.3 0-3.8 1.4-3.8 3.9v1.7H8v2.7h1.9V20h3.3v-7.7h2.3l.4-2.7h-2.7z" />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/huynh-nhat-huy-520227311/"
          aria-label="LinkedIn"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2a3442] bg-[#141a22] text-slate-200 hover:border-[#6f7cff] hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M4.98 3.5a2.48 2.48 0 1 0 0 4.96 2.48 2.48 0 0 0 0-4.96zM3 9h3.96v12H3V9zm7.2 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-3.96v-5.24c0-1.25-.02-2.86-1.74-2.86-1.74 0-2 1.36-2 2.77V21H10.2V9z" />
          </svg>
        </a>
        <a
          href="https://github.com/hetoke"
          aria-label="GitHub"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2a3442] bg-[#141a22] text-slate-200 hover:border-[#6f7cff] hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.07c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.78-1.34-1.78-1.1-.76.08-.75.08-.75 1.22.09 1.86 1.26 1.86 1.26 1.08 1.86 2.82 1.32 3.5 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.64.25 2.86.12 3.16.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5z" />
          </svg>
        </a>
      </div>
    </main>
  );
};

export default About;
