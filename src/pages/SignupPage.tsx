import React from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import playogaLogo from '@/assets/playoga-logo.png';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-sunset p-4">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-sage/10 blur-3xl organic-blob" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-terracotta/10 blur-3xl organic-blob-2" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={playogaLogo} 
            alt="Playoga" 
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <p className="text-muted-foreground mt-2">Start your wellness journey today</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
