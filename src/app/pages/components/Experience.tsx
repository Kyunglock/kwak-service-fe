import { Briefcase } from 'lucide-react';

interface ExperienceProps {
  company: string;
  position: string;
  period: string;
  duration: string;
  description: string;
  responsibilities: string[];
}

export function Experience({ 
  company, 
  position, 
  period, 
  duration, 
  description, 
  responsibilities 
}: ExperienceProps) {
  return (
    <div className="border-l-4 border-green-600 pl-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent rounded-r-lg">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{company}</h3>
          <p className="text-gray-600">{position}</p>
        </div>
        <div className="mt-2 md:mt-0 md:text-right">
          <p className="font-semibold text-gray-900">{period}</p>
          <p className="text-gray-600">{duration}</p>
        </div>
      </div>
      
      <p className="text-gray-700 mb-3">{description}</p>
      
      <div className="space-y-2">
        {responsibilities.map((resp, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span className="text-gray-700 flex-1">{resp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}