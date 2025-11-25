import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Gallery } from './components/Gallery';
import { AdminPanel } from './components/AdminPanel';
import { Lightbox } from './components/Lightbox';
import { Photo, ViewMode } from './types';
import { getPhotos, initStorage } from './services/storageUtils';
import { Loader2 } from 'lucide-react';

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.GALLERY);

  // Initialize storage and load photos on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initStorage();
        await refreshPhotos();
      } catch (error) {
        console.error("Failed to initialize storage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const refreshPhotos = async () => {
    try {
      const loadedPhotos = await getPhotos();
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error("Failed to refresh photos:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-accent" size={48} />
            <p className="text-secondary tracking-widest uppercase text-sm">Loading Portfolio...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {currentView === ViewMode.GALLERY && (
          <Gallery 
            photos={photos} 
            onPhotoClick={setSelectedPhoto} 
          />
        )}
        {currentView === ViewMode.ADMIN && (
          <AdminPanel 
            photos={photos} 
            refreshPhotos={refreshPhotos}
            onExit={() => setCurrentView(ViewMode.GALLERY)}
          />
        )}
      </Layout>

      <Lightbox 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />
    </>
  );
}

export default App;