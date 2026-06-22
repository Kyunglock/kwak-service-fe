export function TechStack() {
  const skills = [
    { category: 'Languages', items: ['Java', 'JavaScript'] },
    { category: 'Frontend', items: ['Vue.js', 'React'] },
    { category: 'Backend', items: ['Spring Boot', 'Spring Framework'] },
    { category: 'Database', items: ['MySQL', 'Oracle'] },
    { category: 'DevOps', items: ['Docker', 'Redis', 'GitLab', 'GitHub'] }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skills.map((skillGroup) => (
        <div key={skillGroup.category} className="border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="font-semibold text-gray-900 mb-2">{skillGroup.category}</div>
          <div className="flex flex-wrap gap-2">
            {skillGroup.items.map((item) => (
              <span 
                key={item} 
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm border border-green-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}