import React, { useState, useRef } from 'react';
import { Photo } from '../types';
import { savePhoto, resizeImage, deletePhoto } from '../services/storageUtils';
import { analyzeImage } from '../services/geminiService';
import { Trash2, Upload, Sparkles, X, Plus, Image as ImageIcon, Loader2, LogOut, Cloud, Lock } from 'lucide-react';

interface AdminPanelProps {
  photos: Photo[];
  refreshPhotos: () => Promise<void>;
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ photos, refreshPhotos, onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-surface p-10 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-purple-600"></div>
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Lock size={32} className="text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-white">Admin Access</h2>
          <p className="text-center text-secondary mb-8 text-sm">Enter your credentials to manage the portfolio.</p>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-6 text-center">{error}</div>}
          
          <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/5">
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return <Dashboard photos={photos} refreshPhotos={refreshPhotos} onLogout={() => { setIsAuthenticated(false); onExit(); }} />;
};

interface DashboardProps {
  photos: Photo[];
  refreshPhotos: () => Promise<void>;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ photos, refreshPhotos, onLogout }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploads, setUploads] = useState<{
    file: File;
    preview: string;
    title: string;
    description: string;
    tags: string;
    analyzing: boolean;
  }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      setIsUploading(true);
      
      const newUploads = await Promise.all(files.map(async (file) => {
        // Resize for storage optimization
        const resized = await resizeImage(file, 1600, 0.85); 
        return {
          file,
          preview: resized,
          title: '',
          description: '',
          tags: '',
          analyzing: false
        };
      }));

      setUploads(prev => [...prev, ...newUploads]);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const updateUploadField = (index: number, field: string, value: string) => {
    setUploads(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAIAnalyze = async (index: number) => {
    const item = uploads[index];
    if (!item.preview) return;

    setUploads(prev => {
      const copy = [...prev];
      copy[index].analyzing = true;
      return copy;
    });

    try {
      const result = await analyzeImage(item.preview);
      setUploads(prev => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          title: result.title,
          description: result.description,
          tags: result.tags.join(', '),
          analyzing: false
        };
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Check API key configuration.");
      setUploads(prev => {
        const copy = [...prev];
        copy[index].analyzing = false;
        return copy;
      });
    }
  };

  const handlePublishAll = async () => {
    setIsPublishing(true);
    let count = 0;
    
    try {
      const promises = uploads.map(item => {
        const finalTitle = item.title || "Untitled";
        
        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          url: item.preview,
          title: finalTitle,
          description: item.description,
          tags: item.tags.split(',').map(t => t.trim()).filter(t => t),
          dateUploaded: Date.now()
        };
        return savePhoto(newPhoto);
      });

      await Promise.all(promises);
      count = promises.length;

      setUploads([]);
      await refreshPhotos();
      alert(`Successfully published ${count} photos to the gallery.`);
    } catch (error) {
      console.error("Publishing error:", error);
      alert("Failed to publish some photos.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this photo permanently? This action cannot be undone.")) {
      try {
        await deletePhoto(id);
        await refreshPhotos();
      } catch (error) {
        alert("Failed to delete photo.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Content Manager</h2>
          <div className="flex items-center gap-2 text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded w-fit">
            <Cloud size={12} />
            <span>Persistent Storage Active</span>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-surface rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-semibold flex items-center gap-3 text-white">
            <div className="p-2 bg-accent/20 rounded-lg text-accent"><Upload size={20} /></div>
            Upload New Photos
          </h3>
          {uploads.length > 0 && (
             <button 
               onClick={handlePublishAll}
               disabled={isPublishing}
               className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
             >
               {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <Cloud size={18} />}
               {isPublishing ? 'Syncing to Gallery...' : `Publish ${uploads.length} Photos`}
             </button>
          )}
        </div>

        {uploads.length === 0 ? (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-white/10 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-secondary transition-all cursor-pointer group bg-background/50 ${isUploading ? 'opacity-50' : 'hover:border-accent/50 hover:bg-accent/5'}`}
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {isUploading ? (
                <Loader2 className="animate-spin mb-4 text-accent" size={48} />
            ) : (
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-white/50 group-hover:text-accent transition-colors" size={32} />
                </div>
            )}
            <p className="font-bold text-lg text-white mb-2">{isUploading ? 'Processing images...' : 'Click to select photos'}</p>
            <p className="text-sm text-secondary text-center max-w-sm">
                High-resolution images supported. Photos are stored permanently in the secure database.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {uploads.map((upload, idx) => (
                <div key={idx} className="bg-background/80 backdrop-blur rounded-xl p-4 flex flex-col md:flex-row gap-6 relative animate-fade-in border border-white/5 hover:border-white/10 transition-colors">
                    <button onClick={() => removeUpload(idx)} className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10">
                        <X size={20} />
                    </button>
                    
                    <div className="w-full md:w-64 aspect-video md:aspect-[4/3] rounded-lg overflow-hidden bg-black/50 flex-shrink-0 shadow-lg relative group">
                        <img src={upload.preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-mono text-white/70">PREVIEW</span>
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 py-1">
                        <div className="flex gap-3">
                            <div className="flex-grow space-y-1">
                                <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Title</label>
                                <input 
                                type="text" 
                                placeholder="Give this moment a name..." 
                                value={upload.title}
                                onChange={(e) => updateUploadField(idx, 'title', e.target.value)}
                                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                            />
                            </div>
                            <div className="pt-6">
                                <button 
                                onClick={() => handleAIAnalyze(idx)}
                                disabled={upload.analyzing}
                                className="h-[42px] px-4 flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-bold hover:from-purple-500/20 hover:to-accent/20 transition-all disabled:opacity-50 whitespace-nowrap"
                                title="Auto-generate title, description and tags"
                                >
                                {upload.analyzing ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14} />}
                                Auto-Fill
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Description</label>
                            <textarea 
                                placeholder="What's the story behind this photo?" 
                                value={upload.description}
                                onChange={(e) => updateUploadField(idx, 'description', e.target.value)}
                                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent focus:outline-none h-24 resize-none transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Tags</label>
                            <input 
                                type="text" 
                                placeholder="nature, portrait, bw (comma separated)" 
                                value={upload.tags}
                                onChange={(e) => updateUploadField(idx, 'tags', e.target.value)}
                                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
                ))}
            </div>
             
             <div 
               onClick={() => !isPublishing && fileInputRef.current?.click()}
               className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center text-secondary hover:bg-white/5 hover:text-white cursor-pointer transition-all gap-2"
             >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isPublishing}
                />
                <Plus size={18} />
                <span className="text-sm font-medium">Add more photos to batch</span>
             </div>
          </div>
        )}
      </div>

      {/* Existing Photos List */}
      <div>
        <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-semibold text-white">Managed Gallery</h3>
             <span className="text-secondary text-sm">{photos.length} items published</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-surface rounded-xl overflow-hidden border border-white/10 group relative hover:border-white/30 transition-colors">
              <div className="aspect-square relative overflow-hidden bg-black/50">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => handleDelete(photo.id)}
                    className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transform scale-90 group-hover:scale-100 transition-all"
                    title="Delete permanently"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm text-white truncate" title={photo.title}>{photo.title}</h4>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-white/40 truncate">{new Date(photo.dateUploaded).toLocaleDateString()}</p>
                    <span className="w-2 h-2 rounded-full bg-green-500" title="Published"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};