import Header from "../../components/Header/Header";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import Footer from "../../components/Footer/Footer";

import "./Register.css";

function Register() {
  return (
    <div className="register-page">

      <main className="register-main">
        <RegisterForm />
      </main>
    </div>
  );
}

export default Register;