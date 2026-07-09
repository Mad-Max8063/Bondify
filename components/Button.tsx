import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ok';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-bold transition-all duration-200 ease-fluid active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none";

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-field",
    md: "px-4 py-3 rounded-field",
  };

  const variants = {
    primary: "bg-led-500 text-ink-950 hover:bg-led-400",
    secondary: "bg-ink-800 text-zinc-100 border border-white/10 hover:border-white/20 hover:bg-ink-700",
    ghost: "bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
    danger: "bg-danger-dim text-white hover:brightness-110",
    ok: "bg-ok-dim text-ink-950 hover:brightness-110",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
