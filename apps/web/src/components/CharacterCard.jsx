import React, { useRef, useState } from 'react';
import { Edit2, Trash2, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const CharacterCard = ({ character, onEdit, onDelete, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Parse extended data from description if it's JSON
  let extendedData = {};
  try {
    if (character.description && character.description.startsWith('{')) {
      extendedData = JSON.parse(character.description);
    }
  } catch (e) {
    // Ignore parse errors, fallback to empty object
  }

  // Determine role/class
  const role = character.role || extendedData.archetype || 'Unknown Class';

  // Use uploaded portrait if available, otherwise fallback to generated avatar
  const imageUrl = character.portrait 
    ? pb.files.getUrl(character, character.portrait)
    : (extendedData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${character.id}&backgroundColor=1a1a1a`);

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP.');
      return;
    }

    // Validate size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 20MB.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('portrait', file);

      await pb.collection('characters').update(character.id, formData, { $autoCancel: false });
      toast.success('Portrait updated successfully.');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload portrait. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div 
      className="group relative w-full aspect-[2/3] fantasy-card-frame rounded-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_hsl(var(--gold-glow)/0.4)] cursor-pointer flex flex-col"
      onClick={onEdit}
    >
      {/* Corner Ornaments */}
      <div className="fantasy-card-inner-corner-1"></div>
      <div className="fantasy-card-inner-corner-2"></div>

      {/* Image Background & Upload Area */}
      <div className="absolute inset-1.5 border border-[hsl(var(--gold-dark))]/50 overflow-hidden bg-black group/image">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 z-10 pointer-events-none" />
        
        {character.portrait ? (
          <img 
            src={imageUrl} 
            alt={`Portrait of ${character.name}`} 
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isUploading ? 'opacity-40 blur-sm' : 'opacity-80 group-hover:opacity-100'}`} 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/80 text-zinc-500 transition-colors group-hover/image:bg-zinc-800/80">
            <Camera className="w-12 h-12 mb-3 opacity-40" />
            <span className="text-xs font-serif uppercase tracking-widest opacity-50">No Portrait</span>
          </div>
        )}

        {/* Upload Overlay */}
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={handleImageClick}
          title="Click to upload portrait"
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-[hsl(var(--gold-light))]">
              <Loader2 className="w-8 h-8 mb-2 animate-spin" />
              <span className="text-xs font-cinzel tracking-wider animate-pulse">Scribing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-[hsl(var(--gold-light))] transform transition-transform duration-300 hover:scale-110">
              <Camera className="w-8 h-8 mb-2 drop-shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
              <span className="text-xs font-cinzel tracking-wider drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">Change Portrait</span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
        />
      </div>

      {/* Actions Overlay (Hover) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-9 w-9 bg-black/80 hover:bg-black border border-[hsl(var(--gold-dark))] text-[hsl(var(--gold-light))] shadow-lg" 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit Character"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="destructive" 
          size="icon" 
          className="h-9 w-9 bg-red-950/80 hover:bg-red-900 border border-red-500/50 shadow-lg" 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete Character"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="relative z-20 mt-auto p-3 text-center w-full pointer-events-none">
        <div className="border-t border-b border-[hsl(var(--gold-dark))] py-3 bg-black/70 backdrop-blur-md shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[hsl(var(--gold-light))] tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-2 truncate">
            {character.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[hsl(var(--gold-dark))]"></div>
            <p className="text-xs font-serif text-gray-300 tracking-widest uppercase">
              {role}
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[hsl(var(--gold-dark))]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;