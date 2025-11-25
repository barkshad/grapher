import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Gallery } from './components/Gallery';
import { AdminPanel } from './components/AdminPanel';
import { Lightbox } from './components/Lightbox';
import { Photo } from './types';
import { getPhotos } from './services/storageUtils';

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPage, setCurrentPage] = useState<'gallery' | 'admin'>('gallery');

  // Load photos on mount
  useEffect(() => {
    refreshPhotos();
  }, []);

  const refreshPhotos = () => {
    setPhotos(getPhotos());
  };

  // Simple state-based routing for this SPA to avoid URL complexity with hash router hooks manually
  // Using conditional rendering based on a simple state that the Layout controls
  
  return (
    <>
      <Layout 
        currentPage={currentPage} 
        onNavigate={(page) => setCurrentPage(page)}
      >
        {currentPage === 'gallery' ? (
           <Gallery photos={photos} onPhotoClick={setSelectedPhoto} />
        ) : (
           <AdminPanel photos={photos} refreshPhotos={refreshPhotos} />
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
