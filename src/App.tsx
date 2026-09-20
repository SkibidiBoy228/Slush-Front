import Register from "./pages/Register/Register";
import LoginPage from "./pages/Login/LoginPage";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Home from "./pages/Home/Home";

import GamePage from "./pages/GamePage/GamePage";
import CharacteristicsPage from "./pages/CharacteristicsPage/CharacteristicsPage";
import DlcPage from "./pages/DlcPage/DlcPage";

function App() {
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  if (pathParts[0] === "game" && pathParts[1]) {
    const appId = pathParts[1];

    if (pathParts[2] === "characteristics") {
      return <CharacteristicsPage appId={appId} />;
    }

    if (pathParts[2] === "dlc") {
      const dlcId = pathParts[3];

      return (
        <DlcPage
          appId={appId}
          dlcId={dlcId}
        />
      );
    }

    return <GamePage appId={appId} />;
  }

  if (pathParts[0] === "login") {
    return <LoginPage />;
  }

  if (pathParts[0] === "register") {
    return <Register />;
  }

  if (pathParts[0] === "forgot-password") {
    return <ForgotPassword />;
  }

  if (pathParts[0] === "reset-password") {
    return <ResetPassword />;
  }

  if (pathParts[0] === "verify-email") {
    return <VerifyEmail />;
  }

  if (
    window.location.pathname === "/" ||
    window.location.pathname === "/mainPage"
  ) {
    return <Home />;
  }

  return <Home />;
}

export default App;