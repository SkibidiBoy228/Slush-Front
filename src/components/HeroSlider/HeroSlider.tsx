import { useState } from "react";

import "./HeroSlider.css";

interface HeroSlide {
  title: string;
  description: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  date?: string;
}

const heroSlides: HeroSlide[] = [
  {
    title: "Avatar: Frontiers of Pandora",
    description:
      "Avatar: Frontiers of Pandora™ — це пригодницька гра від першої особи, де події розгортаються на західному кордоні.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2840770/header.jpg",
    price: "911₴",
    oldPrice: "1519₴",
    discount: "-40%",
    date: "Знижка діє до 24.06.2024 10:00",
  },
  {
    title: "Cyberpunk 2077",
    description:
      "Пориньте у величезний відкритий світ Night City та станьте кіберпанком, який бореться за своє майбутнє.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    price: "1 099₴",
  },
  {
    title: "Відьмак 3: Дикий гін",
    description:
      "Епічна рольова гра у величезному відкритому світі, де Геральт із Рівії шукає Цирі.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    price: "729₴",
  },
  {
    title: "Manor Lords",
    description:
      "Середньовічна стратегія з будівництвом міста, управлінням ресурсами та масштабними битвами.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1363080/header.jpg",
    price: "449₴",
    oldPrice: "599₴",
    discount: "-25%",
  },
  {
    title: "Stardew Valley",
    description:
      "Створіть власну ферму, досліджуйте долину, знайомтеся з її мешканцями та будуйте нове життя.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    price: "229₴",
  },
  {
    title: "Ghost of Tsushima",
    description:
      "Станьте самураєм та захистіть острів Цусіма від монгольської навали.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg",
    price: "1699₴",
  },
  {
    title: "FAR: Lone Sails",
    description:
      "Атмосферна подорож через висохлий світ на борту унікального транспортного засобу.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/609320/header.jpg",
    price: "34₴",
    oldPrice: "229₴",
    discount: "-85%",
  },
  {
    title: "Project Zomboid",
    description:
      "Виживайте у світі, охопленому зомбі-апокаліпсисом, шукайте ресурси та будуйте укриття.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    price: "415₴",
  },
  {
    title: "Subnautica",
    description:
      "Досліджуйте загадковий підводний світ чужої планети та виживайте серед його небезпек.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg",
    price: "1 348₴",
    oldPrice: "898₴",
    discount: "-10%",
  },
  {
    title: "Counter-Strike 2",
    description:
      "Безкоштовний тактичний шутер з командними боями та змагальним режимом.",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    price: "Безкоштовно",
  },
];

function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slide = heroSlides[activeSlide];

  const previous = () => {
    setActiveSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1,
    );
  };

  const next = () => {
    setActiveSlide((prev) =>
      prev === heroSlides.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <section className="hero-slider-container">
      <div className="hero-section">
        <img
          className="hero-background"
          src={slide.image}
          alt={slide.title}
        />

        <div className="hero-dark-overlay" />

        {/* Верхняя панель внутри баннера */}
        <div className="store-panel">
          <div className="store-search">
            <input
              type="text"
              placeholder="Пошук у Крамниці..."
            />

            <button
              className="search-button"
              aria-label="Пошук"
            >
              ⌕
            </button>
          </div>

          <button className="store-link">
            Каталог
          </button>

          <button className="store-link">
            Новини
          </button>

          <div className="store-actions">
            <button
              className="store-circle"
              aria-label="Обране"
            >
              ♡
            </button>

            <button
              className="store-circle"
              aria-label="Кошик"
            >
              🛒
            </button>
          </div>
        </div>

        <div className="hero-title-background">
          {slide.title}
        </div>

        <div className="hero-content">
          <div className="hero-sale">
            {slide.discount && (
              <span className="hero-discount">
                {slide.discount}
              </span>
            )}

            <div className="hero-price">
              <strong>{slide.price}</strong>

              {slide.oldPrice && (
                <del>{slide.oldPrice}</del>
              )}
            </div>
          </div>

          {slide.date && (
            <span className="hero-date">
              {slide.date}
            </span>
          )}

          <h1>{slide.title}</h1>

          <p>{slide.description}</p>
        </div>

        <button
          className="hero-arrow hero-arrow-left"
          onClick={previous}
          aria-label="Попередній слайд"
        >
          ‹
        </button>

        <button
          className="hero-arrow hero-arrow-right"
          onClick={next}
          aria-label="Наступний слайд"
        >
          ›
        </button>
      </div>

      <div className="thumbnail-section">
        <div className="thumbnail-list">
          {heroSlides.map((item, index) => (
            <button
              key={item.title}
              className={`thumbnail ${
                index === activeSlide ? "selected" : ""
              }`}
              onClick={() => setActiveSlide(index)}
            >
              <img src={item.image} alt="" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;