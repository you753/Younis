import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeContext } from '@/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">تبديل المظهر</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="ml-2 h-4 w-4" />
          فاتح
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="ml-2 h-4 w-4" />
          داكن
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('auto')}>
          <Monitor className="ml-2 h-4 w-4" />
          تلقائي
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}