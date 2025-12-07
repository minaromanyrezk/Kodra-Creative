import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KodraIconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: number | string;
  strokeWidth?: number;
  isActive?: boolean;
}

export const KodraIcon: React.FC<KodraIconProps> = ({ 
  icon: Icon, 
  size = 20, 
  strokeWidth = 1.5, 
  isActive = false,
  className = "",
  ...props
}) => {
  return (
    <Icon 
      size={size} 
      strokeWidth={isActive ? 2.5 : strokeWidth} 
      className={`transition-all duration-300 ${className}`}
      {...props}
    />
  );
};
