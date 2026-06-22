import { ExternalLink, Users } from 'lucide-react';

interface ProjectProps {
  title: string;
  period: string;
  description: string;
  techStack: string[];
  role: string;
  teamSize?: string;
  highlights: string[];
  url?: string;
}

export function Project({ 
  title, 
  period, 
  description, 
  techStack, 
  role, 
  teamSize,
  highlights,
  url
}: ProjectProps) {
  return (
    <div className="border border-green-200 rounded-lg p-6 bg-gradient-to-br from-green-50/30 to-emerald-50/30 hover:shadow-lg hover:border-green-300 transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{title}</h3>
        <span className="text-sm text-gray-600 mt-1 md:mt-0">{period}</span>
      </div>
      
      <p className="text-gray-700 mb-3">{description}</p>
      
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-1">기술 스택</div>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span 
              key={tech} 
              className="bg-green-600 text-white px-3 py-1 rounded text-sm shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {teamSize && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
          <Users className="size-4 text-green-600" />
          <span>{teamSize}</span>
        </div>
      )}
      
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-1">역할</div>
        <p className="text-gray-700">{role}</p>
      </div>
      
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">주요 성과</div>
        <ul className="space-y-2">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-green-600 mt-1 flex-shrink-0">▸</span>
              <span className="text-gray-700">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm transition-colors font-medium"
        >
          <ExternalLink className="size-4" />
          프로젝트 바로가기
        </a>
      )}
    </div>
  );
}