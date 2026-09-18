import Register from "./pages/Register/Register";
import LoginPage from "./pages/Login/LoginPage";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Home from "./pages/Home/Home";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/forgot-password") {
    return <ForgotPassword />;
  }

  if (path === "/reset-password") {
    return <ResetPassword />;
  }

  if (path === "/verify-email") {
    return <VerifyEmail />;
  }

  if (path === "/mainPage") {
    return <Home />;
  }

  return <Home />;
}

export default App;