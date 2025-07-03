import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardStepProps {
  title: string;
  description: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  loading?: boolean;
}

export function WizardStep({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  showBack = true,
  showNext = true,
  loading = false,
}: WizardStepProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={!showBack || loading}
              className={!showBack ? 'invisible' : ''}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!showNext || loading}
              className={!showNext ? 'invisible' : ''}
            >
              {nextLabel}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 