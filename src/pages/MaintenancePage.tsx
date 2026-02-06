import React from 'react';
import playogaLogo from '@/assets/playoga-logo.png';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex flex-col items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-fade-in">
        {/* Logo with breathing animation */}
        <div className="mb-12 animate-breathe">
          <img 
            src={playogaLogo} 
            alt="Playoga" 
            className="h-20 md:h-28 w-auto drop-shadow-lg"
          />
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            We're preparing something beautiful.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Playoga will be live in just a few minutes.
          </p>
        </div>

        {/* Loading spinner */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
            {/* Spinning ring */}
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            {/* Inner dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Subtle decorative line */}
        <div className="mt-16 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
};

export default MaintenancePage;
