interface CoverLetterProps {
  title: string;
  content: string;
}

export function CoverLetter({ title, content }: CoverLetterProps) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}
