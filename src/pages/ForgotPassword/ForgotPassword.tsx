import {useState} from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { forgotPassword } from "../../api/auth";

import "./ForgotPassword.css";

function ForgotPassword(){
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSumbit: React.SubmitEventHandler<HTMLFormElement> = async (event) =>{
        event.preventDefault();

        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();
        if(!trimmedEmail){
            setError("Введіть e-mail");
            return;
        }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)){
            setError("Введіть коректний e-mail");
            return;
          }

        try{
            setLoading(true);

            const response = await forgotPassword({email:trimmedEmail});
            setSuccess(response.message || " Код відновлення надіслано на вашу електронну пошту");
            
            setTimeout(()=>{
                window.location.href = `/reset-password?email=${encodeURIComponent(trimmedEmail)}`;
            },1000);
        }catch(error){
            if(error instanceof Error){
                setError(error.message);
            }else{
                setError("Не вдалося надіслати код відновлення");
            }
        }finally{
            setLoading(false);
        }
    };

    return(
        <div className="forgot-password-page">
            <Header/>
            <main className="forgot-password-main">
                <section className="forgot-password-card">
                    <h1>відновлення пароля</h1>
                    <p className="forgot-password-description">
                        Введіть e-mail, який ви використовували
                        під час реєстрації. Ми надішлемо на нього
                        код для відновлення пароля.
                    </p>

                    <form onSubmit={handleSumbit}>
                        <div className="forgot-password-form-group">
                            <label htmlFor="forgot-email">
                                E-mail
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="Введіть ваш e-mail..."
                                value={email}
                                onChange={(event)=>setEmail(event.target.value)}
                                disabled={loading}
                                autoComplete = "email"
                            />
                        </div>
                        {error && (<div className="forgot-password-message forgot-password-error">{error}</div>)}

                        {success && (<div className="forgot-password-message forgot-password-success">{success}</div>)}

                        <button className="forgot-password-button"
                        type="submit"
                        disabled= {loading}>{loading ? "Надсилання..." : "Надіслати код"}</button>
                    </form>
                      <div className="forgot-password-login-link">
                            Згадали пароль?{" "}
                            <a href="/login">Увійти</a>
                        </div>
                </section>
            </main>
            <Footer/>
        </div>
    )
}

export default ForgotPassword;