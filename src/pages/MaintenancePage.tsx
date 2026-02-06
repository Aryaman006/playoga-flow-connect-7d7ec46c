import React from 'react';
import playogaLogo from '@/assets/playoga-logo.png';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-gold-light/30 to-accent/20 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orb - top left */}
        <div 
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gold/20 to-terracotta-light/10 blur-3xl"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        
        {/* Medium floating orb - bottom right */}
        <div 
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-accent/25 to-gold-light/15 blur-3xl"
          style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '-3s' }}
        />
        
        {/* Small floating orb - center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent blur-2xl"
          style={{ animation: 'breathe-scale 6s ease-in-out infinite' }}
        />
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-gold/40 animate-pulse" />
        <div className="absolute bottom-32 left-32 w-2 h-2 rounded-full bg-terracotta/30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-20 w-4 h-4 rounded-full bg-accent/30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-gold-light/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Main content card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg animate-fade-in">
        {/* Glowing background for logo */}
        <div className="relative mb-10">
          <div className="absolute inset-0 scale-150 bg-gradient-radial from-gold/30 via-transparent to-transparent blur-2xl animate-breathe" />
          
          {/* Logo with breathing animation */}
          <img 
            src={playogaLogo} 
            alt="Playoga" 
            className="relative h-24 md:h-32 w-auto drop-shadow-2xl animate-breathe"
          />
        </div>

        {/* Glass card for message */}
        <div className="backdrop-blur-md bg-white/40 border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-gold/10">
          {/* Decorative top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full" />
          
          {/* Message */}
          <div className="space-y-4 mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal leading-tight">
              We're preparing something{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-gold">
                beautiful
              </span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal-light leading-relaxed">
              Playoga will be live in just a few minutes.
            </p>
          </div>

          {/* Elegant loading indicator */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative flex items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-gold/40 to-accent/40 blur-xl animate-pulse" />
              
              {/* Outer ring */}
              <div className="relative w-14 h-14 rounded-full border-2 border-gold/30">
                {/* Spinning gradient ring */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    borderTopColor: 'hsl(43 85% 68%)',
                    borderRightColor: 'hsl(30 55% 65%)',
                    animation: 'spin 1.5s linear infinite'
                  }}
                />
                
                {/* Inner pulsing dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gold to-terracotta animate-pulse shadow-lg shadow-gold/50" />
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground font-medium tracking-wide">
              Setting up your wellness journey...
            </p>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-12 flex items-center space-x-3">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-terracotta/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>

      {/* Subtle footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground/60 tracking-wider">
          © {new Date().getFullYear()} Playoga. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
