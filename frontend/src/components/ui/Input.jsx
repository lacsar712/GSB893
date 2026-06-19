import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200',
        'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200',
        'transition-all duration-200',
        'placeholder:text-gray-400',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
