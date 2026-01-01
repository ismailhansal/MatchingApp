// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'default';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Warn if Cloudinary config is missing
if (!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
  console.warn('Cloudinary configuration missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env file');
}

export const uploadProfileImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    // Convert image URI to blob
    console.log('Fetching image from:', imageUri);
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Image blob is empty');
    }

    console.log('Image blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);

    // Create FormData for Cloudinary upload
    const formData = new FormData();
    
    // Add file with proper type
    const file = {
      uri: imageUri,
      type: 'image/jpeg',
      name: `avatar_${userId}.jpg`,
    };
    formData.append('file', file as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `profile-pictures/${userId}`);
    formData.append('public_id', `avatar_${userId}`);

    console.log('Uploading to Cloudinary:', CLOUDINARY_UPLOAD_URL);
    console.log('Upload preset:', CLOUDINARY_UPLOAD_PRESET);

    // Upload to Cloudinary with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const uploadResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Cloudinary response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Cloudinary upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('Upload successful, URL:', uploadData.secure_url);
    
    if (!uploadData.secure_url) {
      throw new Error('No secure_url in Cloudinary response');
    }
    
    return uploadData.secure_url;
  } catch (error: any) {
    console.error('Error uploading image:', error?.message || error);
    throw error;
  }
};

export const deleteProfileImage = async (userId: string): Promise<void> => {
  try {
    // Note: Deletion requires authenticated API call. For now, we'll just log.
    // If needed, you can implement server-side deletion via a Cloud Function.
    console.log('Image deletion handled by Cloudinary retention settings');
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Generate a default avatar URL based on user ID
export const getDefaultAvatarUrl = (userId: string): string => {
  // Using a simple hash-based avatar service
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
};
