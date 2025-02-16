import React from 'react';

export default function LoadingSpinner({ size = 'default', text }) {
  // Tailwind classes based on size prop
  const sizes = {
    small: 'w-4 h-4 border-2',
    default: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  const sizeClass = sizes[size] || sizes.default;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${sizeClass} rounded-full border-blue-200 border-t-blue-600 animate-spin`} />
      {text && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </div>
  );
}