import "./Header.css";

const Header = () =>{
    return(
        <header className="header">
            <div className="header-container">
                <a href= "/" className="logo">
                    SLUSH
                </a>
                <nav className="navigation">
                    <a href="/shop">Крамниця</a>
                    <a href="/library">Бібліотека</a>
                    <a href="/chat">Чат</a>
                </nav>
                    <a href="/login" className="login-button">
                        Увійти
                    </a>
            </div>
        </header>
    )
}

export default Header;