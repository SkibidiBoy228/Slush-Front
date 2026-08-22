import Register from "./pages/Register/Register";

import LoginPage from "./pages/Login/LoginPage";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword"
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/forgot-password") {
    return <ForgotPassword />;
  }

  if (path === "/reset-password") {
    return <ResetPassword />;
  }

  return <Register />;
}

export default App;