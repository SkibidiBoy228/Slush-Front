import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoginForm from "../../components/LoginForm/LoginForm";

import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <LoginForm />
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;