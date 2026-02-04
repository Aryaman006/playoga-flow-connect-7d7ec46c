import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-sunset p-4">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-terracotta/10 blur-3xl organic-blob" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-sage/10 blur-3xl organic-blob-2" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display font-bold text-3xl">P</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Playoga</h1>
          <p className="text-muted-foreground mt-2">Your journey to inner peace</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
