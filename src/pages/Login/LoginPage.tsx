import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoginForm from "../../components/LoginForm/LoginForm";

import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">

      <main className="login-main">
        <LoginForm />
      </main>
    </div>
  );
}

export default LoginPage;