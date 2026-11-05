import type { ReactNode } from "react";
import FriendPresenceNotifications from "../Friends/FriendPresenceNotifications/FriendPresenceNotifications";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <FriendPresenceNotifications />
      {children}
    </>
  );
}

export default AppLayout;