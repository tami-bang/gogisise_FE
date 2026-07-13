import { PageLayout } from '../components/common/PageLayout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { FontSizeSelector } from '../components/common/FontSizeSelector';
import { FavoriteManager } from '../components/domain/FavoriteManager';

export function SettingsPage() {
  return (
    <PageLayout>
      <Header title="설정" />
      <div className="w-full pt-4">
        <FontSizeSelector />
      </div>
      
      <div className="w-full flex-1">
        <FavoriteManager />
      </div>
      <Footer activeTab="settings" />
    </PageLayout>
  );
}
