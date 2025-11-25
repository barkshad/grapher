import React, { useState, useRef } from 'react';
import { Photo } from '../types';
import { savePhoto, resizeImage, deletePhoto } from '../services/storageUtils';
import { analyzeImage } from '../services/geminiService';
import { Trash2, Upload, Sparkles, X, Plus, Image as ImageIcon, Loader2, LogOut } from 'lucide-react';

interface AdminPanelProps {
  photos: Photo[];
  refreshPhotos: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ photos, refreshPhotos }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Authentication check (Simple hardcoded)
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-surface p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
              placeholder="Enter password..."
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return <Dashboard photos={photos} refreshPhotos={refreshPhotos} onLogout={() => setIsAuthenticated(false)} />;
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
        // Resize immediately for preview and storage
        const resized = await resizeImage(file, 1200, 0.85); // Increased quality for persistent storage
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
      // Reset input
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
      alert("AI Analysis failed. Check console or API key.");
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
      alert(`Successfully published ${count} photos.`);
    } catch (error) {
      console.error("Publishing error:", error);
      alert("Failed to publish some photos.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this photo permanently?")) {
      try {
        await deletePhoto(id);
        await refreshPhotos();
      } catch (error) {
        alert("Failed to delete photo.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-secondary text-sm">Manage your portfolio content</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-surface rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Upload size={20} /> New Upload</h3>
          {uploads.length > 0 && (
             <button 
               onClick={handlePublishAll}
               disabled={isPublishing}
               className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
             >
               {isPublishing ? <Loader2 className="animate-spin" size={16} /> : null}
               {isPublishing ? 'Publishing...' : `Publish ${uploads.length} Photos`}
             </button>
          )}
        </div>

        {uploads.length === 0 ? (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-secondary transition-colors cursor-pointer ${isUploading ? 'opacity-50' : 'hover:border-accent hover:text-accent'}`}
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
            {isUploading ? <Loader2 className="animate-spin mb-2" size={32} /> : <ImageIcon className="mb-2" size={32} />}
            <p className="font-medium">{isUploading ? 'Processing images...' : 'Click to select photos'}</p>
            <p className="text-xs mt-1 text-white/40">Supported: JPG, PNG, WEBP (Saved to Persistent Storage)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploads.map((upload, idx) => (
              <div key={idx} className="bg-background rounded-xl p-4 flex flex-col sm:flex-row gap-4 relative animate-fade-in border border-white/5">
                <button onClick={() => removeUpload(idx)} className="absolute top-2 right-2 p-1 text-white/40 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
                
                <div className="w-full sm:w-48 aspect-video sm:aspect-square rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                  <img src={upload.preview} alt="Preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Title" 
                      value={upload.title}
                      onChange={(e) => updateUploadField(idx, 'title', e.target.value)}
                      className="flex-grow bg-surface border border-white/10 rounded px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    />
                    <button 
                      onClick={() => handleAIAnalyze(idx)}
                      disabled={upload.analyzing}
                      className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 px-3 py-2 rounded text-xs font-bold hover:bg-accent/20 transition-colors disabled:opacity-50"
                      title="Auto-generate details with Gemini AI"
                    >
                      {upload.analyzing ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14} />}
                      AI Magic
                    </button>
                  </div>
                  <textarea 
                    placeholder="Description" 
                    value={upload.description}
                    onChange={(e) => updateUploadField(idx, 'description', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-sm focus:border-accent focus:outline-none h-20 resize-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Tags (comma separated)" 
                    value={upload.tags}
                    onChange={(e) => updateUploadField(idx, 'tags', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            ))}
             <div 
               onClick={() => !isPublishing && fileInputRef.current?.click()}
               className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center text-secondary hover:bg-white/5 cursor-pointer transition-colors"
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
                <span className="flex items-center gap-2 text-sm font-medium"><Plus size={16} /> Add more photos</span>
             </div>
          </div>
        )}
      </div>

      {/* Existing Photos List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Gallery ({photos.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-surface rounded-lg overflow-hidden border border-white/10 group">
              <div className="aspect-square relative overflow-hidden">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(photo.id)}
                    className="bg-red-500/80 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm truncate">{photo.title}</h4>
                <p className="text-xs text-white/50 truncate">{new Date(photo.dateUploaded).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};