import { useState, useRef } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

const publicKey = 'public_azt5Ajej+aCS04kMNP/IPHgNq3A=';
const urlEndpoint = 'https://ik.imagekit.io/wevawpivo';

const ImageUpload = ({ 
  currentImage, 
  onUploadSuccess, 
  folder = 'barbers',
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
  tokenType = 'admin', // 'admin' or 'barber'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const inputRefTest = useRef(null);

  const authenticator = async () => {
    try {
      const response = tokenType === 'barber' 
        ? await uploadAPI.getAuthParamsBarber()
        : await uploadAPI.getAuthParamsAdmin();
      return response.data;
    } catch (error) {
      throw new Error('Authentication failed: ' + error.message);
    }
  };

  const onError = (err) => {
    console.error('Upload error:', err);
    toast.error('Failed to upload image');
    setUploading(false);
  };

  const onSuccess = (res) => {
    console.log('Upload success:', res);
    setPreview(res.url);
    setUploading(false);
    toast.success('Image uploaded successfully');
    
    if (onUploadSuccess) {
      onUploadSuccess({
        url: res.url,
        fileId: res.fileId,
      });
    }
  };

  const onUploadStart = () => {
    setUploading(true);
  };

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  return (
    <IKContext 
      publicKey={publicKey} 
      urlEndpoint={urlEndpoint} 
      authenticator={authenticator}
    >
      <div className={`relative ${className}`}>
        {/* Preview / Placeholder */}
        <div 
          className={`${sizeClasses[size]} overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer transition hover:border-white/40`}
          onClick={() => inputRefTest.current?.click()}
        >
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : preview ? (
            <img 
              src={preview} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          ) : (
            <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          )}
        </div>

        {/* Hidden file input from ImageKit */}
        <IKUpload
          fileName={`avatar_${Date.now()}`}
          folder={`/${folder}`}
          tags={['avatar']}
          useUniqueFileName={true}
          isPrivateFile={false}
          onError={onError}
          onSuccess={onSuccess}
          onUploadStart={onUploadStart}
          accept="image/*"
          style={{ display: 'none' }}
          ref={inputRefTest}
        />

        {/* Upload button overlay */}
        <button
          type="button"
          onClick={() => inputRefTest.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:bg-white/90 disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      </div>
    </IKContext>
  );
};

export default ImageUpload;
