import React, { useMemo, useState } from 'react';
import { Photo } from '../types';
import { Search } from 'lucide-react';

interface GalleryProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ photos, onPhotoClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(p => p.tags.forEach(t => tags.add(t.toLowerCase())));
    return Array.from(tags).sort();
  }, [photos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            photo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? photo.tags.some(t => t.toLowerCase() === selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [photos, searchTerm, selectedTag]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-secondary">Curated collection of moments.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary group-focus-within:text-white">
                    <Search size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search photos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-white/30 w-full sm:w-64 transition-colors"
                />
            </div>
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2">
        <button 
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                selectedTag === null ? 'bg-white text-black border-white' : 'bg-transparent text-secondary border-white/10 hover:border-white/30'
            }`}
        >
            All
        </button>
        {allTags.map(tag => (
            <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    selectedTag === tag ? 'bg-white text-black border-white' : 'bg-transparent text-secondary border-white/10 hover:border-white/30'
                }`}
            >
                #{tag}
            </button>
        ))}
      </div>

      {/* Masonry Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 text-secondary">
            <p>No photos found matching your criteria.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo) => (
            <div 
                key={photo.id} 
                className="break-inside-avoid group relative cursor-zoom-in overflow-hidden rounded-xl bg-surface"
                onClick={() => onPhotoClick(photo)}
            >
                <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-semibold text-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{photo.title}</h3>
                    <p className="text-white/80 text-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">{new Date(photo.dateUploaded).toLocaleDateString()}</p>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
