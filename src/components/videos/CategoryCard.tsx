import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  id: string;
  name: string;
  thumbnailUrl?: string;
  videoCount?: number;
  isFeatured?: boolean;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  thumbnailUrl,
  videoCount = 0,
  isFeatured = false,
  className,
}) => {
  return (
    <Link
      to={`/browse?category=${id}`}
      className={cn(
        'group relative block overflow-hidden rounded-2xl aspect-[4/3] transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]',
        className
      )}
    >
      {/* Background Image */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-calm" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold text-charcoal text-xs font-semibold uppercase tracking-wider">
          Featured
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-display text-2xl font-semibold text-white text-shadow">
          {name}
        </h3>
        <p className="mt-1 text-sm text-white/70">
          {videoCount} {videoCount === 1 ? 'video' : 'videos'}
        </p>
      </div>

      {/* Decorative Element */}
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  );
};
