import React from 'react';
import { faHtml5, faCss, faJs, faPython } from '@fortawesome/free-brands-svg-icons';

const ICON_MAP = {
  html: faHtml5,
  html5: faHtml5,
  css: faCss,
  css3: faCss,
  javascript: faJs,
  js: faJs,
  python: faPython,
  py: faPython,
};

/**
 * BrandIcon Component
 * Menampilkan logo resmi FontAwesome:
 * - HTML: https://fontawesome.com/icons/brands/solid/html5 (faHtml5)
 * - CSS: https://fontawesome.com/icons/brands/solid/css (faCss)
 * - JS: https://fontawesome.com/icons/brands/solid/js (faJs)
 * - Python: https://fontawesome.com/icons/brands/solid/python (faPython)
 */
export function BrandIcon({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
  style = {},
  title,
}) {
  const normalizedName = String(name || '').toLowerCase().trim();
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
