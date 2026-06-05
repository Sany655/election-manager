"use client";

import React, { useState } from "react";
import Sidebar from "../sidebar";
import Header from "../header";


const DefaultLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    
      <div className="flex h-screen w-full bg-background text-foreground">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            title={title}
          />

          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8 bg-muted">
            <div className="mx-auto max-w-screen-2xl space-y-6">{children}</div>
          </main>
        </div>
      </div>

  );
};

export default DefaultLayout;
