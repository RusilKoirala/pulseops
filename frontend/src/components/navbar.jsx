import { Button } from '@/components/ui/button';
import { ModeSwitcher } from '@/components/ui/theme-toggle';
import { Link } from 'react-router-dom'; 

export function Navbar() {
  return (
    <header className="fixed top-3 z-50 w-full px-3">
      <div className="mx-auto flex h-12 w-full max-w-4xl items-center bg-background/70 justify-between rounded-full border  pr-2 pl-4 shadow-sm backdrop-blur">
        <a href="/" className="text-lg font-semibold tracking-tight">
          PulseOps
        </a>
        <div className="flex items-center gap-1.5">
          <ModeSwitcher />
          <Button size="sm" className="rounded-full">Login</Button>
        </div>
      </div>
    </header>
  );
}
