
import { useEffect, useState } from "react";
import LibraryLayout from "../../components/Library/layout/LibraryLayout";
import LibraryNewsSection from "../../components/Library/Home/LibraryNewsSection";
import CommunityHighlights from "../../components/Library/Home/CommunityHighlights";
import { getLibraryHome } from "../../api/library";
import type { LibraryHome } from "../../types/library";
import "./LibraryHomePage.css";

function LibraryHomePage() {
  const [home, setHome] = useState<LibraryHome | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        const data = await getLibraryHome();

        if (active) {
          setHome(data);
          setError(null);
        }
      } catch (err) {
        console.error("Не вдалося завантажити бібліотеку:", err);

        if (active) {
          setError("Не вдалося завантажити дані бібліотеки.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

  return (
    <LibraryLayout>
      <div className="library-home">
        <div className="library-home__header">
          <h1>Моя бібліотека</h1>

          <a
            href="/library/feed"
            className="library-home__feed-button"
          >
            Лента сообщества →
          </a>
        </div>

        {isLoading ? (
          <p>Завантаження бібліотеки...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : home ? (
          <>
            <section className="library-home__section">
              <h2>Останні ігри</h2>

              {home.recentGames.length > 0 ? (
                <div className="library-home__games">
                  {home.recentGames.map((game) => (
                    <a
                      key={game.gameId}
                      className="library-home__game"
                      href={`/library/game/${encodeURIComponent(game.gameId)}`}
                    >
                      <img
                        src={game.coverImage}
                        alt=""
                        loading="lazy"
                      />
                      <span>{game.title}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="library-home__empty">
                  Нещодавно запущених ігор поки немає.
                </p>
              )}
            </section>

            <LibraryNewsSection news={home.latestNews} />

            <CommunityHighlights
              posts={home.communityHighlights}
            />
          </>
        ) : null}
      </div>
    </LibraryLayout>
  );
}

export default LibraryHomePage;
