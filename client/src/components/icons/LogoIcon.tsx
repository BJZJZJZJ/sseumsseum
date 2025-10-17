interface LogoProps {
  className?: string;
}

export const LogoIcon = ({ className }: LogoProps) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none"
  >
    <circle cx="50" cy="50" r="48" stroke="#4F46E5" strokeWidth="4" />
    <path 
      d="M35 30 L50 45 L65 30" 
      stroke="#4338CA" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M35 70 L50 55 L65 70" 
      stroke="#6D28D9" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const LogoWordmark = ({ className }: LogoProps) => (
  <svg 
    className={className}
    viewBox="0 0 200 60" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      {`.heavy { font: bold 50px sans-serif; fill: #312E81; }`}
    </style>
    <text x="10" y="50" className="heavy">씀</text>
    <text x="70" y="50" className="heavy">씀</text>
    <circle cx="95" cy="35" r="10" fill="#4F46E5" />
    <text x="89" y="41" style={{ fill: 'white', font: 'bold 14px sans-serif' }}>₩</text>
  </svg>
);

export const LogoGraph = ({ className }: LogoProps) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="20" y="50" width="20" height="30" rx="4" fill="#6366F1"/>
    <rect x="45" y="30" width="20" height="50" rx="4" fill="#4F46E5"/>
    <rect x="70" y="60" width="20" height="20" rx="4" fill="#818CF8"/>
  </svg>
);

