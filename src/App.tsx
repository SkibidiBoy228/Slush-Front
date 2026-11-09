import Register from "./pages/Register/Register";
import LoginPage from "./pages/Login/LoginPage";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Home from "./pages/Home/Home";
import Friends from "./pages/Friends/Friend";
import LibraryGamePage from "./pages/LibraryGamePage/LibraryGamePage";

import GamePage from "./pages/GamePage/GamePage";
import CharacteristicsPage from "./pages/CharacteristicsPage/CharacteristicsPage";
import DlcPage from "./pages/DlcPage/DlcPage";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/EditProfile/EditProfile";
import CommunityPage from "./pages/CommunityPage/CommunityPage";

import Catalog from "./pages/Catalog/Catalog";
import NewsPage from "./pages/NewsPage/NewsPage";
import WishlistPage from "./pages/Wishlist/WishlistPage";
import CartPage from "./pages/CartPage/CartPage";
import Settings from "./pages/Settings/Settings";
import Notifications from "./pages/Notification/Notification";

import LibraryHomePage from "./pages/LibraryHomePage/LibraryHomePage";
import LibraryFeedPage from "./pages/LibraryFeedPage/LibraryFeedPage";
import ChatPage from "./pages/Chat/ChatPage";

import { usePresence } from "./hooks/usePresence";
import { isAuthenticated } from "./api/client";
import AppLayout from "./components/layout/AppLayout";

function App() {
  usePresence();

  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  let page;

  if (pathParts[0] === "game" && pathParts[1]) {
    const appId = pathParts[1];

    if (pathParts[2] === "characteristics") {
      page = <CharacteristicsPage appId={appId} />;
    } else if (pathParts[2] === "dlc") {
      const dlcId = pathParts[3];
      page = <DlcPage appId={appId} dlcId={dlcId} />;
    } else if (pathParts[2] === "community") {
      page = <CommunityPage gameId={appId} />;
    } else {
      page = <GamePage appId={appId} />;
    }
  } else if (pathParts[0] === "library") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    if (pathParts[1] === "game" && pathParts[2]) {
      page = (
        <LibraryGamePage
          gameId={decodeURIComponent(pathParts[2])}
        />
      );
    } else if (pathParts[1] === "feed") {
      page = <LibraryFeedPage />;
    } else {
      page = <LibraryHomePage />;
    }
  } else if (pathParts[0] === "settings") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <Settings />;
  } else if (pathParts[0] === "notifications") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <Notifications />;
  } else if (pathParts[0] === "profile" && pathParts[1]) {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    const username = decodeURIComponent(pathParts[1]);
    page = <Profile username={username} />;
  } else if (pathParts[0] === "friends") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <Friends />;
  } else if (pathParts[0] === "chat") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <ChatPage />;
  } else if (pathParts[0] === "edit-profile") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <EditProfile />;
  } else if (pathParts[0] === "wishlist") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <WishlistPage />;
  } else if (pathParts[0] === "cart") {
    if (!isAuthenticated()) {
      window.location.replace("/login");
      return null;
    }

    page = <CartPage />;
  } else if (pathParts[0] === "catalog") {
    page = <Catalog />;
  } else if(pathParts[0] === "news"){
    page = <NewsPage/>
  } else if (pathParts[0] === "login") {
    page = <LoginPage />;
  } else if (pathParts[0] === "register") {
    page = <Register />;
  } else if (pathParts[0] === "forgot-password") {
    page = <ForgotPassword />;
  } else if (pathParts[0] === "reset-password") {
    page = <ResetPassword />;
  } else if (pathParts[0] === "verify-email") {
    page = <VerifyEmail />;
  } else if (
    window.location.pathname === "/" ||
    window.location.pathname === "/mainPage"
  ) {
    page = <Home />;
  } else {
    page = <Home />;
  }

  const hideFooter = ["profile", "edit-profile", "chat"].includes(
    pathParts[0]
  );

  return (
    <AppLayout showFooter={!hideFooter}>
      {page}
    </AppLayout>
  );
}

export default App;