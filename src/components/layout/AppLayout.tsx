import type { ReactNode } from "react";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import FriendPresenceNotifications from "../Friends/FriendPresenceNotifications/FriendPresenceNotifications";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

function AppLayout({
  children,
  showHeader = true,
  showFooter = true,
}: AppLayoutProps) {
  return (
    <>
      <FriendPresenceNotifications />

      {showHeader && <Header />}

      {children}

      {showFooter && <Footer />}
    </>
  );
}

export default AppLayout;