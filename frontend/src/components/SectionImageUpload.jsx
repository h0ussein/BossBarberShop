import { useState, useRef } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

const publicKey = 'public_azt5Ajej+aCS04kMNP/IPHgNq3A=';
const urlEndpoint = 'https://ik.imagekit.io/wevawpivo';

const SectionImageUpload = ({ 
  currentImage, 
  onUploadSuccess, 
  folder = 'homepage-sections',
  tokenType = 'admin',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const inputRef = useRef(null);

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

  return (
    <IKContext 
      publicKey={publicKey} 
      urlEndpoint={urlEndpoint} 
      authenticator={authenticator}
    >
      <div className="relative">
        {/* Preview / Placeholder */}
        <div 
          className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-black/20 bg-black/5 cursor-pointer transition hover:border-black/40"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            </div>
          ) : preview ? (
            <img 
              src={preview} 
              alt="Section preview" 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <svg className="h-12 w-12 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-6.364-9.364l2.909-2.909m0 0l2.909 2.909-6.364 6.364m-2.909-9.364l-6.364 6.364" />
              </svg>
              <p className="mt-2 text-sm text-black/50">Click to upload image</p>
            </div>
          )}
        </div>

        {/* Hidden file input from ImageKit */}
        <IKUpload
          fileName={`section_${Date.now()}`}
          folder={`/${folder}`}
          tags={['homepage-section']}
          useUniqueFileName={true}
          isPrivateFile={false}
          onError={onError}
          onSuccess={onSuccess}
          onUploadStart={onUploadStart}
          accept="image/*"
          style={{ display: 'none' }}
          ref={inputRef}
        />
      </div>
    </IKContext>
  );
};

export default SectionImageUpload;
