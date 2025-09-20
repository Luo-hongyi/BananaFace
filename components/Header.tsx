
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header>
      <h1 className="text-2xl sm:text-3xl font-extralight text-gray-800 dark:text-gray-100 flex items-baseline">
        <span className="mr-2 text-2xl sm:text-3xl">🍌</span>
        <span className="tracking-wide">BananaFace</span>
        <span className="text-lg sm:text-2xl font-extralight text-gray-500 dark:text-gray-400 ml-2">｜ZHO</span>
      </h1>
    </header>
  );
};
