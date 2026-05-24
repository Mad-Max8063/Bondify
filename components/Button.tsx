import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'community';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] border border-white/10 hover:brightness-110",
    secondary: "bg-obsidian-light text-slate-100 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600",
    ghost: "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200",
    danger: "bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:bg-red-600 border border-white/10 hover:brightness-110",
    community: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] border border-white/10 hover:brightness-110"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};