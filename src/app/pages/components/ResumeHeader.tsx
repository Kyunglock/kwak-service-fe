import { Mail, Phone, Calendar } from "lucide-react";

interface ResumeHeaderProps {
  name: string;
  englishName: string;
  email: string;
  phone: string;
  birthYear: string;
  photoUrl?: string;
  summary?: string;
}

export function ResumeHeader({
  name,
  englishName,
  email,
  phone,
  birthYear,
  photoUrl,
  summary,
}: ResumeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white px-8 py-10">
      {summary && (
        <div className="mb-6 border-l-4 border-white/60 pl-4">
          <p className="text-lg md:text-xl font-semibold text-white leading-snug tracking-wide">
            {summary}
          </p>
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <p className="text-xl text-green-100 mb-4">{englishName}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-green-50">
            <div className="flex items-center gap-2">
              <Mail className="size-4" />
              <a
                href={`mailto:${email}`}
                className="hover:text-white transition-colors"
              >
                {email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{birthYear}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
          서버/백엔드 개발자
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
          웹 풀스택 개발자
        </div>
      </div>
    </div>
  );
}
