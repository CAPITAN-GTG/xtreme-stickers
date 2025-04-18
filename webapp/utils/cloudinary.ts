import { v2 as cloudinary } from 'cloudinary';

// Check for required environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing required Cloudinary environment variables');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

function extractPublicId(url: string): string | null {
  try {
    // Match pattern: /v{version number}/{folder name}/{public_id}.{extension}
    const match = url.match(/\/v\d+\/([^/]+\/[^.]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) {
      console.error('No image URL provided');
      return false;
    }

    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      console.error('Could not extract public ID from URL:', imageUrl);
      return false;
    }

    console.log('Attempting to delete image with public ID:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      console.error('Cloudinary deletion failed:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
} 