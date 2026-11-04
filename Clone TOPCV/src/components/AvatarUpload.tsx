import React, { useRef } from 'react';
import { useCV } from '../context/CVContext';
import { Camera } from 'lucide-react';

interface AvatarUploadProps {
  size?: string; // e.g. "w-32 h-32"
  shape?: 'circle' | 'rounded' | 'square';
  borderColor?: string;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  size = 'w-32 h-32',
  shape = 'circle',
  borderColor,
  className = '',
}) => {
  const { cvData, updateProfile } = useCV();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!cvData.profile.showAvatar) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateProfile('avatar', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const shapeClass =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'rounded'
      ? 'rounded-2xl'
      : 'rounded-lg';

  const defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

  return (
    <div className={`relative shrink-0 group ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`${size} ${shapeClass} overflow-hidden border-4 cursor-pointer shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg relative bg-slate-100`}
        style={{ borderColor: borderColor || cvData.theme.primaryColor }}
        title="Nhấp để tải lên hoặc đổi ảnh đại diện"
      >
        <img
          src={cvData.profile.avatar || defaultAvatar}
          alt={cvData.profile.fullName || 'Avatar'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-opacity duration-200 print:hidden">
          <Camera className="w-5 h-5 mb-1 text-white" />
          <span>Đổi ảnh</span>
        </div>
      </div>
    </div>
  );
};
