import React from "react";

const HomePageHeader: React.FC = () => {
  return (
    <section className="border-b border-slate-200 pb-10">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">
          <span>MERN Stack Architecture</span>
          <span aria-hidden="true">·</span>
          <span>REST API v1</span>
          <span aria-hidden="true">·</span>
          <span>MongoDB &amp; Mongoose ODM</span>
        </div>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5"
          style={{ textWrap: "balance" }}
        >
          Engineering publications for systems architects.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
          A production blog engine crafted with full MongoDB ODM semantics, JWT
          access &amp; refresh token lifecycles, and strict role-based access
          control.
        </p>
      </div>
    </section>
  );
};

export default HomePageHeader;
