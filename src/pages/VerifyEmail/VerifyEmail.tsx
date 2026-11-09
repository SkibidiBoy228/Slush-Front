import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import VerifyEmailForm from "../../components/VerifyEmailForm/VerifyEmailForm";

import "./VerifyEmail.css";

function VerifyEmail() {
  return (
    <div className="verify-email-page">
      <main className="verify-email-main">
        <VerifyEmailForm />
      </main>
    </div>
  );
}

export default VerifyEmail;