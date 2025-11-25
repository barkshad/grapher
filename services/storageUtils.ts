import { Photo } from '../types';

const DB_NAME = 'LuminaPortfolioDB';
const STORE_NAME = 'photos';
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = 'lumina_portfolio_photos';
const INIT_FLAG_KEY = 'lumina_initialized';

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

// Open Database Helper
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Initialize Storage (Migrate from LocalStorage if needed)
export const initStorage = async (): Promise<void> => {
  const db = await openDB();
  
  // If we have already initialized the app once, do not re-seed data even if DB is empty (user deleted all).
  const isInitialized = localStorage.getItem(INIT_FLAG_KEY);
  if (isInitialized) {
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
      if (countRequest.result === 0) {
        // Check for Legacy LocalStorage Data
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          try {
            const parsedData: Photo[] = JSON.parse(localData);
            console.log("Migrating data from LocalStorage to IndexedDB...");
            parsedData.forEach(photo => store.add(photo));
            // Optional: Clear local storage after migration
            // localStorage.removeItem(LOCAL_STORAGE_KEY); 
          } catch (e) {
            console.error("Migration failed", e);
            INITIAL_PHOTOS.forEach(photo => store.add(photo));
          }
        } else {
          // Seed with initial data only on first run
          INITIAL_PHOTOS.forEach(photo => store.add(photo));
        }
      }
      
      // Mark as initialized so future reloads don't re-seed deleted data
      localStorage.setItem(INIT_FLAG_KEY, 'true');
      resolve();
    };

    countRequest.onerror = () => reject(countRequest.error);
  });
};

export const getPhotos = async (): Promise<Photo[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by date descending
      const photos = request.result as Photo[];
      resolve(photos.sort((a, b) => b.dateUploaded - a.dateUploaded));
    };

    request.onerror = () => reject(request.error);
  });
};

export const savePhoto = async (photo: Photo): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(photo); // put updates if exists, adds if not

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deletePhoto = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updatePhoto = async (updatedPhoto: Photo): Promise<void> => {
  return savePhoto(updatedPhoto);
};

// Utility to resize image (Helper remains sync/promise based but strictly purely computational)
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
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(elem.toDataURL('image/jpeg', quality));
        } else {
            reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};