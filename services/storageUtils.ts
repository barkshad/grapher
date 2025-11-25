import { Photo } from '../types';

const STORAGE_KEY = 'lumina_portfolio_photos';

// Initial mock data to populate if empty
const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'init-1',
    url: 'https://picsum.photos/id/10/800/600',
    title: 'Misty Forest',
    description: 'A serene view of the forest in the early morning mist.',
    tags: ['nature', 'forest', 'calm'],
    dateUploaded: Date.now() - 1000000,
  },
  {
    id: 'init-2',
    url: 'https://picsum.photos/id/15/800/500',
    title: 'Waterfall',
    description: 'Powerful waterfall cascading down the rocks.',
    tags: ['water', 'nature', 'power'],
    dateUploaded: Date.now() - 2000000,
  },
  {
    id: 'init-3',
    url: 'https://picsum.photos/id/20/600/800',
    title: 'Study Desk',
    description: 'Minimalist workspace setup.',
    tags: ['tech', 'indoor', 'work'],
    dateUploaded: Date.now() - 3000000,
  },
  {
    id: 'init-4',
    url: 'https://picsum.photos/id/28/800/500',
    title: 'Forest Path',
    description: 'A winding path through the autumn woods.',
    tags: ['autumn', 'forest', 'path'],
    dateUploaded: Date.now() - 4000000,
  },
  {
    id: 'init-5',
    url: 'https://picsum.photos/id/42/600/700',
    title: 'Coffee Break',
    description: 'Enjoying a warm cup of coffee.',
    tags: ['coffee', 'lifestyle', 'morning'],
    dateUploaded: Date.now() - 5000000,
  },
];

export const getPhotos = (): Photo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PHOTOS));
      return INITIAL_PHOTOS;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load photos", error);
    return [];
  }
};

export const savePhoto = (photo: Photo): Photo[] => {
  const current = getPhotos();
  const updated = [photo, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    alert("Storage full! Please delete some photos or use smaller images.");
  }
  return updated;
};

export const deletePhoto = (id: string): Photo[] => {
  const current = getPhotos();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updatePhoto = (updatedPhoto: Photo): Photo[] => {
  const current = getPhotos();
  const updated = current.map(p => p.id === updatedPhoto.id ? updatedPhoto : p);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Utility to resize image to prevent LocalStorage quota exceeded
export const resizeImage = (file: File, maxWidth = 1000, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
