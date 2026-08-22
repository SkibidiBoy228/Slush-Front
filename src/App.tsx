import Register from "./pages/Register/Register";
import LoginPage from "./pages/Login/LoginPage";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <LoginPage />;
  }

  return <Register />;
}

export default App;