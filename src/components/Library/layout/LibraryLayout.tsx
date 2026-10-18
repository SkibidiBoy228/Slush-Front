import type { ReactNode } from "react";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import LibrarySidebar from "./LibrarySidebar";
import "./LibraryLayout.css"

interface LibraryLayoutProps{
    children: ReactNode;
}

function LibraryLayout({children} : LibraryLayoutProps){
    return(
        <div className="library-layout">
            <Header/>
            <div className="linrary-layout__body">
                <LibrarySidebar/>

                <div className="library-layout__main">
                    <main className="library-layout__content">
                        {children}
                    </main>
                    <Footer/>
                </div>
            </div>
        </div>
    )
}
export default LibraryLayout;