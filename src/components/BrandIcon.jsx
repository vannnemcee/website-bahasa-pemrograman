import React from 'react';
import {
  faHtml5,
  faCss,
  faJs,
  faPython,
  faPhp,
  faTypescript,
  faJava,
  faGolang,
} from '@fortawesome/free-brands-svg-icons';

const ICON_MAP = {
  html: faHtml5,
  html5: faHtml5,
  css: faCss,
  css3: faCss,
  javascript: faJs,
  js: faJs,
  python: faPython,
  py: faPython,
  php: faPhp,
  typescript: faTypescript,
  ts: faTypescript,
  java: faJava,
  go: faGolang,
  golang: faGolang,
};

export function BrandIcon({
  name,
  size = 22,
  color = 'currentColor',
  className = '',
  style = {},
  title,
}) {
  const normalizedName = String(name || '').toLowerCase().trim();

  if (normalizedName === 'cpp' || normalizedName === 'c++') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        className={`brand-icon brand-icon-cpp ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style,
        }}
        aria-hidden={!title}
        role={title ? 'img' : 'presentation'}
      >
        {title && <title>{title}</title>}
        <path
          d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
          stroke={color}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 9.2A3.6 3.6 0 1 0 10.5 14.8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13 12H16M14.5 10.5V13.5M17 12H20M18.5 10.5V13.5"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizedName === 'sql') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        className={`brand-icon brand-icon-sql ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style,
        }}
        aria-hidden={!title}
        role={title ? 'img' : 'presentation'}
      >
        {title && <title>{title}</title>}
        <ellipse cx="12" cy="5.5" rx="7.5" ry="3" stroke={color} strokeWidth="1.9" />
        <path
          d="M4.5 5.5V12C4.5 13.66 7.86 15 12 15C16.14 15 19.5 13.66 19.5 12V5.5"
          stroke={color}
          strokeWidth="1.9"
        />
        <path
          d="M4.5 12V18.5C4.5 20.16 7.86 21.5 12 21.5C16.14 21.5 19.5 20.16 19.5 18.5V12"
          stroke={color}
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  const iconDef = ICON_MAP[normalizedName];
  if (!iconDef || !iconDef.icon) {
    return null;
  }

  const [width, height, , , svgPathData] = iconDef.icon;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      fill={color}
      className={`brand-icon brand-icon-${normalizedName} ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={!title}
      role={title ? 'img' : 'presentation'}
    >
      {title && <title>{title}</title>}
      <path d={svgPathData} />
    </svg>
  );
}

export default BrandIcon;
