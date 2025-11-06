import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ReaderHeaderProps {
  title: string;
  author: string;
  onBack: () => void;
}

export const ReaderHeader = ({ title, author, onBack }: ReaderHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            {title} by {author}
          </div>
        </div>
      </div>
    </header>
  );
};
