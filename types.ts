export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  dateUploaded: number;
  width?: number;
  height?: number;
}

export interface PhotoFormData {
  file: File | null;
  previewUrl: string;
  title: string;
  description: string;
  tags: string; // Comma separated string for input
}

export enum ViewMode {
  GALLERY = 'GALLERY',
  ADMIN = 'ADMIN',
}
