
import { useTranslation } from "react-i18next";

import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-info">
          <div className="footer-logo">
            SLUSH
          </div>

          <p>
            {t("footer.copyright")}
            {" "}
            {t("footer.legal")}
          </p>
        </div>

        <div className="socials">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="X">𝕏</a>
        </div>

        <div className="footer-links">
          <a href="/terms">
            {t("footer.terms")}
          </a>

          <a href="/privacy">
            {t("footer.privacy")}
          </a>

          <a href="/refund">
            {t("footer.refund")}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
