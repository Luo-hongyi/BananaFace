
import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import type { Lang, Theme } from '../types';

interface SettingsBarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isHistoryVisible: boolean;
  onHistoryToggle: () => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({ lang, onLangChange, theme, onThemeChange, isHistoryVisible, onHistoryToggle }) => {
    const baseButtonClasses = "flex items-center justify-center h-9 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-accent focus:ring-offset-2 dark:focus:ring-offset-black";
      
    return (
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <button 
          onClick={onHistoryToggle} 
          title={lang === 'en' ? 'History' : '历史记录'} 
          className={`${baseButtonClasses} w-9 ${isHistoryVisible ? '!bg-pink-accent !text-white' : ''}`}
        >
          <HistoryIcon />
        </button>
        <button 
          onClick={() => onLangChange(lang === 'en' ? 'zh' : 'en')} 
          className={`${baseButtonClasses} px-3`}
          style={{ minWidth: '50px' }}
        >
          {lang === 'en' ? '中' : 'EN'}
        </button>
        <button 
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} 
          className={`${baseButtonClasses} w-9`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    );
};
