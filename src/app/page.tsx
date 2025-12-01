import { MainLayout } from "@/components/layout/MainLayout";
import { BannerSlider } from "@/components/lobby/BannerSlider";
import { GameGrid } from "@/components/lobby/GameGrid";

export default function Home() {
  return (
    <MainLayout>
      <div className="px-4 py-2 space-y-6">
        <BannerSlider />
        
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Popular Games</h2>
            <button className="text-xs text-gold hover:underline">View All</button>
          </div>
          <GameGrid />
        </section>
      </div>
    </MainLayout>
  );
}
