import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-green-600">
        <div className="text-green-600">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="pl-2">
        {children}
      </div>
    </div>
  );
}