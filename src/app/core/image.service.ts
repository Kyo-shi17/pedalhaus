import { Injectable } from '@angular/core';

/**
 * Reads a user-selected photo, downscales it on a canvas and returns a small
 * JPEG data URL.
 *
 * Bike photos are stored inline on the Firestore document (there is no
 * Cloud Storage bucket in this project), and Firestore caps a document at
 * 1 MiB. Downscaling to 640px keeps a photo around 40–70 kB, which leaves
 * plenty of room for the rest of the record.
 */

const MAX_EDGE = 640;
const JPEG_QUALITY = 0.72;
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class ImageService {
  async toCompressedDataUrl(file: File): Promise<string> {
    if (file.size > MAX_SOURCE_BYTES) {
      throw new Error('That image is larger than 12 MB. Please pick a smaller one.');
    }

    const dataUrl = await this.readAsDataUrl(file);
    const image = await this.loadImage(dataUrl);

    const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Your browser cannot process images right now.');
    }

    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('The image could not be read.'));

      reader.readAsDataURL(file);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('The image could not be decoded.'));

      image.src = src;
    });
  }
}
