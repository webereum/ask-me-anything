import { createClient } from '@/lib/supabase/client';

export interface MediaUploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

export interface GifSearchResult {
  id: string;
  title: string;
  url: string;
  preview_url: string;
  width: number;
  height: number;
}

class MediaService {
  private supabase = createClient();
  private giphyApiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  // File Upload
  async uploadFile(file: File, userId: string): Promise<MediaUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('chat-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('chat-media')
        .getPublicUrl(data.path);

      // Get image dimensions if it's an image
      let dimensions: { width?: number; height?: number } = {};
      if (file.type.startsWith('image/')) {
        dimensions = await this.getImageDimensions(file);
      }

      return {
        url: publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        ...dimensions,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }
  }

  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // GIF Search and Integration
  async searchGifs(query: string, limit: number = 20, offset: number = 0): Promise<GifSearchResult[]> {
    try {
      if (!this.giphyApiKey) {
        throw new Error('Giphy API key not configured');
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${this.giphyApiKey}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=pg-13&lang=en`
      );

      if (!response.ok) {
        throw new Error('Failed to search GIFs');
      }

      const data = await response.json();

      return data.data.map((gif: any) => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.original.url,
        preview_url: gif.images.preview_gif.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
      }));
    } catch (error) {
      console.error('Error searching GIFs:', error);
      throw error;
    }
  }

  async getTrendingGifs(limit: number = 20, offset: number = 0): Promise<GifSearchResult[]> {
    try {
      if (!this.giphyApiKey) {
        throw new Error('Giphy API key not configured');
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${this.giphyApiKey}&limit=${limit}&offset=${offset}&rating=pg-13`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trending GIFs');
      }

      const data = await response.json();

      return data.data.map((gif: any) => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.original.url,
        preview_url: gif.images.preview_gif.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
      }));
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      throw error;
    }
  }

  // Image Processing
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // File Management
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('chat-media')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Utility functions
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('text')) return '📝';
    return '📎';
  }

  // Preview generation
  generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        ctx?.drawImage(video, 0, 0);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnail);
      };

      video.onerror = () => reject(new Error('Failed to generate video thumbnail'));

      video.src = URL.createObjectURL(file);
    });
  }

  // Drag and drop utilities
  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  handleDrop(event: DragEvent): File[] {
    event.preventDefault();
    event.stopPropagation();

    const files: File[] = [];
    
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => {
        try {
          this.validateFile(file);
          files.push(file);
        } catch (error) {
          console.warn(`Skipping invalid file ${file.name}:`, error);
        }
      });
    }

    return files;
  }

  // Paste handling
  handlePaste(event: ClipboardEvent): File[] {
    const files: File[] = [];

    if (event.clipboardData?.files) {
      Array.from(event.clipboardData.files).forEach(file => {
        try {
          this.validateFile(file);
          files.push(file);
        } catch (error) {
          console.warn(`Skipping invalid pasted file:`, error);
        }
      });
    }

    return files;
  }
}

export const mediaService = new MediaService();
export default mediaService;