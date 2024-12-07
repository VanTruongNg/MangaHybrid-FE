'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
} 