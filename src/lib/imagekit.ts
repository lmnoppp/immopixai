import 'server-only';
import ImageKit from 'imagekit';

let imagekitInstance: ImageKit | null = null;

const getImageKitInstance = (): ImageKit => {
  if (!imagekitInstance) {
    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
      throw new Error("Les variables d'environnement ImageKit ne sont pas configurées.");
    }
    
    imagekitInstance = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    });
  }
  return imagekitInstance;
};

export class ImageKitService {
  /**
   * Upload une image sur ImageKit et retourne l'URL publique
   */
  static async uploadImage(file: File): Promise<string> {
    try {
      console.log('📤 Upload ImageKit en cours...');
      
      const imagekit = getImageKitInstance(); // Initialisation différée

      // Convertir le fichier en buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `immopix_${timestamp}_${randomId}.${extension}`;
      
      // Upload sur ImageKit avec qualité maximale
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: fileName,
        folder: '/uploads',
        useUniqueFileName: false,
        tags: ['immopix', 'ai-processing'],
        responseFields: ['url', 'fileId', 'name']
      });
      
      console.log('✅ Image uploadée sur ImageKit:', uploadResponse.url);
      return uploadResponse.url;
      
    } catch (error) {
      console.error('❌ Erreur upload ImageKit:', error);
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  }
  
  /**
   * Supprime une image d'ImageKit (optionnel, pour nettoyer)
   */
  static async deleteImage(fileId: string): Promise<void> {
    try {
      const imagekit = getImageKitInstance(); // Initialisation différée
      await imagekit.deleteFile(fileId);
      console.log('🗑️ Image supprimée d\'ImageKit:', fileId);
    } catch (error) {
      console.error('❌ Erreur suppression ImageKit:', error);
    }
  }
} 