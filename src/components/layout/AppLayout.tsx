
import type { ReactNode } from "react";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import FriendPresenceNotifications from "../Friends/FriendPresenceNotifications/FriendPresenceNotifications";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <FriendPresenceNotifications />

      <Header />

      {children}

      <Footer />
    </>
  );
}

export default AppLayout;
