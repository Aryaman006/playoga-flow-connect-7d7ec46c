import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Crown, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VideoCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number;
  isPremium: boolean;
  yogicPoints: number;
  progress?: number;
  isInWishlist?: boolean;
  onWishlistToggle?: () => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  isPremium,
  yogicPoints,
  progress = 0,
  isInWishlist = false,
  onWishlistToggle,
  className,
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('video-card group', className)}>
      <Link to={`/video/${id}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-calm">
              <Play className="w-12 h-12 text-white/50" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-charcoal/80 text-white text-xs font-medium">
            <Clock className="w-3 h-3 inline-block mr-1" />
            {formatDuration(duration)}
          </div>

          {/* Premium Badge */}
          {isPremium && (
            <div className="absolute top-3 left-3 premium-badge flex items-center space-x-1">
              <Crown className="w-3 h-3" />
              <span>Premium</span>
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-charcoal/50">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}

          {/* Meta */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gold">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">+{yogicPoints} pts</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      {onWishlistToggle && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200',
            isInWishlist ? 'text-primary' : 'text-muted-foreground'
          )}
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle();
          }}
        >
          <Heart className={cn('w-4 h-4', isInWishlist && 'fill-current')} />
        </Button>
      )}
    </div>
  );
};
