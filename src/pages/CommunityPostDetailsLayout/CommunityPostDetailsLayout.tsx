
import type { ReactNode } from "react";

import GameSearch from "../../components/GameSearch/GameSearch";
import CommunityTabs from "../../components/Community/CommunityTabs/CommunityTabs";
import CommunityGamebar from "../../components/Community/CommunityGamebar/CommunityGamebar";

import "./CommunityPostDetailsLayout.css";

interface RecommendedPost {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  postType?: string;
  likesCount: number;
  commentsCount: number;
}

interface CommunityPostDetailsLayoutProps {
  gameId: string;
  gameTitle: string;
  subscribersCount: number;
  activeTab: "about" | "characteristics" | "community";
  recommendationsTitle: string;
  recommendations: RecommendedPost[];
  children: ReactNode;
  onCreatePost: () => void;
  onTabChange: (
    tab: "about" | "characteristics" | "community"
  ) => void;
}

function CommunityPostDetailsLayout({
  gameId,
  gameTitle,
  subscribersCount,
  activeTab,
  recommendationsTitle,
  recommendations,
  children,
  onCreatePost,
  onTabChange,
}: CommunityPostDetailsLayoutProps) {
  return (
    <div className="community-details-page">
      <main className="community-details-container">
        <div className="community-details-search">
          <GameSearch />
        </div>

        <CommunityTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        <div className="community-details-layout">
          <section className="community-details-main">
            {children}
          </section>

          <aside className="community-details-sidebar">
            <CommunityGamebar
              gameId={gameId}
              gameTitle={gameTitle}
              subscribersCount={subscribersCount}
              recommendationsTitle={recommendationsTitle}
              recommendations={recommendations}
              onCreatePost={onCreatePost}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CommunityPostDetailsLayout;
