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
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 border-white/20">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">تبديل المظهر</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Sun className="ml-2 h-4 w-4" />
          فاتح
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            console.log('تم النقر على المظهر الداكن');
            setTheme('dark');
          }}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Moon className="ml-2 h-4 w-4" />
          داكن
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('auto')}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Monitor className="ml-2 h-4 w-4" />
          تلقائي
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}