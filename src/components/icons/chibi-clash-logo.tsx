import type { SVGProps } from 'react';

export function ChibiClashLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="200"
      height="50"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        fontFamily="Poppins, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="url(#logoGradient)"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="0.5"
      >
        Chibi Clash Cards
      </text>
    </svg>
  );
}
