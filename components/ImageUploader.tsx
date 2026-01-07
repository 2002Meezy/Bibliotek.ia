
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageCaptured: (base64: string) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageCaptured, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageCaptured(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-stone-700 mb-4">Tire uma foto da sua estante</h3>
      <div 
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
          preview ? 'border-amber-500' : 'border-stone-300 bg-stone-100 hover:bg-stone-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {preview ? (
          <img src={preview} alt="Estante Preview" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-stone-400 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a48.324 48.324 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <p className="text-stone-500 font-medium">Clique para fazer upload ou tirar foto</p>
            <p className="text-stone-400 text-xs mt-1">Nós analisaremos os títulos dos livros</p>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
