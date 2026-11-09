import type { ReactNode } from "react";
import LibrarySidebar from "./LibrarySidebar";
import "./LibraryLayout.css";

interface LibraryLayoutProps {
  children: ReactNode;
}

function LibraryLayout({ children }: LibraryLayoutProps) {
  return (
    <div className="library-layout">

      <div className="library-layout__body">
        <LibrarySidebar />

        <div className="library-layout__main">
          <main className="library-layout__content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default LibraryLayout;