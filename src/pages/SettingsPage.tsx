import { Layout } from '../components/common/Layout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { FontSizeSelector } from '../components/common/FontSizeSelector';
import { FavoriteManager } from '../components/domain/FavoriteManager';

export function SettingsPage() {
  return (
    <Layout>
      <Header title="설정" />
      <div className="flex flex-col h-full bg-[var(--color-bg)] pt-[72px] pb-[96px]">
        <FontSizeSelector />
        
        <div className="flex-1 min-h-0 overflow-y-auto">
          <FavoriteManager />
        </div>
      </div>
      <Footer activeTab="settings" />
    </Layout>
  );
}
