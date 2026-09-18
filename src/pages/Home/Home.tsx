import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSection from "../../components/GameSection/GameSection";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import GameCard, {
  type Game,
} from "../../components/GameCard/GameCard";

import "./Home.css";

const specialOffers: Game[] = [
  {
    id: 1,
    title: "Cyberpunk 2077",
    price: "1 099₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
  },
  {
    id: 2,
    title: "Відьмак 3: Дикий гін",
    price: "729₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
  },
  {
    id: 3,
    title: "Manor Lords",
    price: "449₴",
    oldPrice: "599₴",
    discount: "-25%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1363080/header.jpg",
  },
];

const recommendedGames: Game[] = [
  {
    id: 4,
    title: "Bellwright",
    price: "600₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1812450/header.jpg",
  },
  {
    id: 5,
    title: "Stardew Valley",
    price: "229₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
  },
  {
    id: 6,
    title: "Ghost of Tsushima",
    price: "1699₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg",
  },
  {
    id: 7,
    title: "Avatar: Frontiers of Pandora",
    price: "911₴",
    oldPrice: "1519₴",
    discount: "-40%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2840770/header.jpg",
  },
];

const budgetGames: Game[] = [
  {
    id: 8,
    title: "FAR: Lone Sails",
    price: "34₴",
    oldPrice: "229₴",
    discount: "-85%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/609320/header.jpg",
  },
  {
    id: 9,
    title: "Placid Plastic Duck Simulator",
    price: "60₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1999360/header.jpg",
  },
  {
    id: 10,
    title: "The Escape: Together",
    price: "74₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2161920/header.jpg",
  },
  {
    id: 11,
    title: "Juro Janosik",
    price: "74₴",
    oldPrice: "245₴",
    discount: "-69%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/978630/header.jpg",
  },
];

const popularGames: Game[] = [
  {
    id: 12,
    title: "Baldur's Gate 3",
    price: "899₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
  },
  {
    id: 13,
    title: "Kingdom Come: Deliverance",
    price: "159₴",
    oldPrice: "799₴",
    discount: "-80%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/379430/header.jpg",
  },
  {
    id: 14,
    title: "Project Zomboid",
    price: "415₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
  },
];

const newReleases: Game[] = [
  {
    id: 15,
    title: "Destiny 2: The Final Shape",
    price: "1 249₴",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header.jpg",
  },
  {
    id: 16,
    title: "Sun Haven",
    price: "230₴",
    oldPrice: "329₴",
    discount: "-30%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1432860/header.jpg",
  },
  {
    id: 17,
    title: "Subnautica",
    price: "1 348₴",
    oldPrice: "898₴",
    discount: "-10%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg",
  },
];

const freeGames: Game[] = [
  {
    id: 18,
    title: "Soul Dossier",
    price: "Безкоштовно",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2827230/header.jpg",
  },
  {
    id: 19,
    title: "Counter-Strike 2",
    price: "Безкоштовно",
    oldPrice: "365₴",
    discount: "-100%",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  },
  {
    id: 20,
    title: "RAID: Shadow Legends",
    price: "Безкоштовно",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2333480/header.jpg",
  },
];

function Home() {
  return (
    <div className="home-page">
      <Header />

      <main>
        <HeroSlider />

        <div className="content-container">
          <GameSection
            title="Особливі пропозиції"
            games={specialOffers}
            variant="wide"
          />

          <GameSection
            title="Рекомендовані вам"
            games={recommendedGames}
            variant="vertical"
          />

          <GameSection
            title="До 100₴"
            games={budgetGames}
            variant="vertical"
          />

          <section className="three-columns">
            <div className="game-column">
              <div className="column-heading">
                <h2>Хіти продажу</h2>

                <button
                  className="column-arrow"
                  aria-label="Наступні"
                >
                  ›
                </button>
              </div>

              <div className="column-games">
                {popularGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    variant="small"
                  />
                ))}
              </div>
            </div>

            <div className="game-column">
              <div className="column-heading">
                <h2>Нові релізи</h2>

                <button
                  className="column-arrow"
                  aria-label="Наступні"
                >
                  ›
                </button>
              </div>

              <div className="column-games">
                {newReleases.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    variant="small"
                  />
                ))}
              </div>
            </div>

            <div className="game-column">
              <div className="column-heading">
                <h2>Безкоштовні</h2>

                <button
                  className="column-arrow"
                  aria-label="Наступні"
                >
                  ›
                </button>
              </div>

              <div className="column-games">
                {freeGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    variant="small"
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;