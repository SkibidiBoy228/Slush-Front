import "./Footer.css";

const Footer = () =>{
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-info">
                    <div className="footer-logo">
                        SLUSH
                    </div>
                    <p>
                         2024, Zubarik inc, Inc. All rights reserved.
                        Zubarik inc, Zubarik inc, the Zubarik inc logo,
                        Zubarik, the Zubarik logo, Unreal, Unreal Engine,
                        the Unreal Engine logo, Unreal Tournament, and the
                        Unreal Tournament logo are trademarks or registered
                        trademarks of Zubarik inc, Inc. in the United States
                        of America and elsewhere.
                    </p>
                </div>
                <div className="social">
                    <a href="#">f</a>
                    <a href="#">◎</a>
                    <a href="#">𝕏</a>
                </div>

                <div className="footer-links">
                    <a href="/terms">Умови використання</a>
                    <a href="/privacy">Політика конфіденційності</a>
                    <a href="/refund">Політика повернення коштів магазину</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer;