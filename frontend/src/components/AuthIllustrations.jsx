import React from 'react';

/**
 * Beautiful, modern SVG illustrations for Student and Admin roles
 * Designed with soft shadows, smooth curves, and academic themes
 */

// Large Student Illustration for Login & Register Left Panel
export const StudentIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', maxWidth: '340px', height: 'auto', ...style }}
  >
    {/* Soft Background Glow Elements */}
    <circle cx="200" cy="180" r="140" fill="#DBEAFE" fillOpacity="0.45" />
    <circle cx="280" cy="90" r="45" fill="#BFDBFE" fillOpacity="0.4" />
    <circle cx="95" cy="240" r="35" fill="#EFF6FF" fillOpacity="0.8" />

    {/* Floating Academic Icons */}
    {/* Floating A+ Grade Badge */}
    <g transform="translate(60, 70)">
      <rect width="56" height="56" rx="14" fill="#FFFFFF" filter="drop-shadow(0 8px 16px rgba(37,99,235,0.15))" />
      <path d="M18 36L28 16L38 36" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 30H35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 22V28M39 25H45" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Floating Graduation Cap */}
    <g transform="translate(270, 60)">
      <rect width="60" height="60" rx="16" fill="#FFFFFF" filter="drop-shadow(0 8px 16px rgba(37,99,235,0.15))" />
      <path d="M12 28L30 19L48 28L30 37L12 28Z" fill="#2563EB" />
      <path d="M21 33V42C21 44.5 25 46.5 30 46.5C35 46.5 39 44.5 39 42V33" fill="#1D4ED8" />
      <path d="M44 29V42" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="42" r="2.5" fill="#F59E0B" />
    </g>

    {/* Floating Exam Results Card */}
    <g transform="translate(265, 230)">
      <rect width="75" height="65" rx="12" fill="#FFFFFF" filter="drop-shadow(0 8px 18px rgba(37,99,235,0.12))" />
      <rect x="12" y="14" width="35" height="5" rx="2.5" fill="#2563EB" />
      <rect x="12" y="25" width="50" height="4" rx="2" fill="#93C5FD" />
      <rect x="12" y="34" width="42" height="4" rx="2" fill="#BFDBFE" />
      <rect x="12" y="44" width="28" height="6" rx="3" fill="#10B981" />
      <circle cx="56" cy="47" r="4" fill="#10B981" />
    </g>

    {/* Student Character */}
    {/* Body / Hoodie */}
    <path
      d="M130 330C130 270 155 245 200 245C245 245 270 270 270 330H130Z"
      fill="#2563EB"
    />
    {/* Hoodie Inner Shadow */}
    <path
      d="M165 245C180 265 220 265 235 245C250 275 255 315 258 330H142C145 315 150 275 165 245Z"
      fill="#1D4ED8"
    />
    {/* Shirt Collar / T-shirt */}
    <path d="M185 245C185 260 215 260 215 245H185Z" fill="#FFFFFF" />

    {/* Neck */}
    <rect x="188" y="215" width="24" height="35" rx="6" fill="#FBD5B5" />

    {/* Head & Hair */}
    <circle cx="200" cy="180" r="48" fill="#FBD5B5" />

    {/* Hair */}
    <path
      d="M152 175C150 140 170 120 200 120C230 120 250 140 248 175C244 148 230 135 200 135C170 135 156 148 152 175Z"
      fill="#1E293B"
    />
    <path
      d="M160 160C165 142 180 130 205 130C225 130 242 140 245 155C235 145 220 140 205 140C185 140 172 148 160 160Z"
      fill="#334155"
    />

    {/* Glasses */}
    <rect x="168" y="165" width="26" height="20" rx="6" fill="none" stroke="#1E293B" strokeWidth="3" />
    <rect x="206" y="165" width="26" height="20" rx="6" fill="none" stroke="#1E293B" strokeWidth="3" />
    <path d="M194 174H206" stroke="#1E293B" strokeWidth="3" />
    <path d="M168 174H156M232 174H244" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

    {/* Friendly Eyes */}
    <circle cx="181" cy="175" r="3" fill="#1E293B" />
    <circle cx="219" cy="175" r="3" fill="#1E293B" />
    {/* Eyebrows */}
    <path d="M172 160C177 158 186 158 190 160" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M210 160C214 158 223 158 228 160" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Smile */}
    <path d="M191 198C195 204 205 204 209 198" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />

    {/* Backpack Straps */}
    <path d="M152 270C152 295 156 315 158 330" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" />
    <path d="M248 270C248 295 244 315 242 330" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" />

    {/* Holding Digital Tablet with Chart */}
    <g transform="translate(145, 275)">
      <rect width="110" height="70" rx="10" fill="#0F172A" />
      <rect x="5" y="5" width="100" height="60" rx="7" fill="#FFFFFF" />
      {/* Mini Bar Chart on Tablet */}
      <rect x="18" y="42" width="10" height="16" rx="2" fill="#3B82F6" />
      <rect x="34" y="30" width="10" height="28" rx="2" fill="#2563EB" />
      <rect x="50" y="22" width="10" height="36" rx="2" fill="#1D4ED8" />
      <rect x="66" y="16" width="10" height="42" rx="2" fill="#10B981" />
      <rect x="82" y="26" width="10" height="32" rx="2" fill="#60A5FA" />
      {/* Student Hands holding tablet */}
      <circle cx="-2" cy="35" r="9" fill="#FBD5B5" />
      <circle cx="112" cy="35" r="9" fill="#FBD5B5" />
    </g>
  </svg>
);

// Large Admin Illustration for Login & Register Left Panel
export const AdminIllustration = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 400 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', maxWidth: '340px', height: 'auto', ...style }}
  >
    {/* Soft Purple Glow Elements */}
    <circle cx="200" cy="180" r="140" fill="#EDE9FE" fillOpacity="0.45" />
    <circle cx="300" cy="100" r="45" fill="#DDD6FE" fillOpacity="0.4" />
    <circle cx="95" cy="235" r="35" fill="#FAF5FF" fillOpacity="0.8" />

    {/* Floating Security Shield Badge */}
    <g transform="translate(55, 70)">
      <rect width="56" height="56" rx="14" fill="#FFFFFF" filter="drop-shadow(0 8px 16px rgba(124,58,237,0.15))" />
      <path
        d="M28 17L38 21.5V29C38 35.5 33.7 41.5 28 43C22.3 41.5 18 35.5 18 29V21.5L28 17Z"
        fill="#7C3AED"
      />
      <path d="M25 30L27 32L32 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Floating Admin Key / Lock */}
    <g transform="translate(280, 65)">
      <rect width="60" height="60" rx="16" fill="#FFFFFF" filter="drop-shadow(0 8px 16px rgba(124,58,237,0.15))" />
      <rect x="18" y="27" width="24" height="18" rx="4" fill="#6D28D9" />
      <path d="M23 27V21C23 17.7 25.7 15 29 15H31C34.3 15 37 17.7 37 21V27" stroke="#8B5CF6" strokeWidth="3" />
      <circle cx="30" cy="35" r="2.5" fill="#FFFFFF" />
    </g>

    {/* Floating Analytics Graph */}
    <g transform="translate(265, 230)">
      <rect width="80" height="65" rx="12" fill="#FFFFFF" filter="drop-shadow(0 8px 18px rgba(124,58,237,0.12))" />
      <path d="M15 48L32 34L48 42L65 20" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="65" cy="20" r="4" fill="#7C3AED" />
      <rect x="15" y="14" width="36" height="4" rx="2" fill="#C4B5FD" />
      <rect x="15" y="22" width="24" height="4" rx="2" fill="#EDE9FE" />
    </g>

    {/* Admin Character */}
    {/* Body / Blazer */}
    <path
      d="M130 330C130 270 155 245 200 245C245 245 270 270 270 330H130Z"
      fill="#4C1D95"
    />
    {/* Lapels */}
    <path d="M175 245L200 300L225 245" fill="#6D28D9" />
    {/* White Dress Shirt */}
    <path d="M185 245L200 280L215 245H185Z" fill="#FFFFFF" />
    {/* Purple Tie */}
    <path d="M197 255L203 255L205 290L200 298L195 290L197 255Z" fill="#7C3AED" />

    {/* Neck */}
    <rect x="188" y="215" width="24" height="35" rx="6" fill="#FBD5B5" />

    {/* Head & Hair */}
    <circle cx="200" cy="180" r="48" fill="#FBD5B5" />

    {/* Professional Slick Hair */}
    <path
      d="M152 170C150 135 170 115 200 115C230 115 248 135 246 170C240 145 225 130 195 130C170 130 158 145 152 170Z"
      fill="#1E293B"
    />
    <path
      d="M165 145C175 130 195 125 215 128C235 130 242 140 244 150C236 138 220 132 205 132C185 132 172 138 165 145Z"
      fill="#334155"
    />

    {/* Professional Frameless Glasses */}
    <rect x="168" y="165" width="26" height="19" rx="5" fill="none" stroke="#4C1D95" strokeWidth="2.5" />
    <rect x="206" y="165" width="26" height="19" rx="5" fill="none" stroke="#4C1D95" strokeWidth="2.5" />
    <path d="M194 173H206" stroke="#4C1D95" strokeWidth="2.5" />
    <path d="M168 173H156M232 173H244" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />

    {/* Confident Eyes */}
    <circle cx="181" cy="174" r="3" fill="#1E293B" />
    <circle cx="219" cy="174" r="3" fill="#1E293B" />

    {/* Eyebrows */}
    <path d="M172 159C177 157 186 157 190 159" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M210 159C214 157 223 157 228 159" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Professional Warm Smile */}
    <path d="M192 198C196 203 204 203 208 198" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />

    {/* Holding Administrator Clipboard */}
    <g transform="translate(150, 275)">
      <rect width="100" height="70" rx="9" fill="#1E1B4B" />
      <rect x="6" y="6" width="88" height="58" rx="6" fill="#FFFFFF" />
      {/* Top Clip */}
      <rect x="35" y="0" width="30" height="10" rx="4" fill="#9CA3AF" />
      {/* Lines of examination records */}
      <rect x="16" y="18" width="30" height="4" rx="2" fill="#7C3AED" />
      <path d="M56 20L60 23L68 16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="28" width="40" height="4" rx="2" fill="#C4B5FD" />
      <path d="M66 30L70 33L78 26" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="38" width="35" height="4" rx="2" fill="#DDD6FE" />
      <path d="M66 40L70 43L78 36" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="48" width="55" height="4" rx="2" fill="#EDE9FE" />
      {/* Hands holding clipboard */}
      <circle cx="2" cy="35" r="8" fill="#FBD5B5" />
      <circle cx="98" cy="35" r="8" fill="#FBD5B5" />
    </g>
  </svg>
);

// Compact Student Avatar for Role Selection Card in Modal
export const StudentAvatar = ({ size = 96, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="48" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2.5" />
    {/* Body */}
    <path d="M26 88C26 68 36 58 50 58C64 58 74 68 74 88H26Z" fill="#2563EB" />
    {/* Collar */}
    <path d="M44 58C44 64 56 64 56 58H44Z" fill="#FFFFFF" />
    {/* Neck */}
    <rect x="45" y="49" width="10" height="12" rx="3" fill="#FBD5B5" />
    {/* Head */}
    <circle cx="50" cy="40" r="18" fill="#FBD5B5" />
    {/* Graduation Cap */}
    <path d="M22 30L50 18L78 30L50 40L22 30Z" fill="#1E293B" />
    <path d="M36 33V43C36 46 42 48 50 48C58 48 64 46 64 43V33" fill="#0F172A" />
    <path d="M72 31V45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="72" cy="45" r="2" fill="#F59E0B" />
    {/* Smile */}
    <path d="M46 46C48 49 52 49 54 46" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    {/* Eyes */}
    <circle cx="43" cy="39" r="1.8" fill="#1E293B" />
    <circle cx="57" cy="39" r="1.8" fill="#1E293B" />
  </svg>
);

// Compact Admin Avatar for Role Selection Card in Modal
export const AdminAvatar = ({ size = 96, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="48" fill="#FAF5FF" stroke="#DDD6FE" strokeWidth="2.5" />
    {/* Body */}
    <path d="M26 88C26 68 36 58 50 58C64 58 74 68 74 88H26Z" fill="#6D28D9" />
    {/* Lapels & Shirt */}
    <path d="M42 58L50 72L58 58" fill="#4C1D95" />
    <path d="M45 58L50 67L55 58H45Z" fill="#FFFFFF" />
    <path d="M49 61L51 61L52 70L50 73L48 70L49 61Z" fill="#7C3AED" />
    {/* Neck */}
    <rect x="45" y="49" width="10" height="12" rx="3" fill="#FBD5B5" />
    {/* Head */}
    <circle cx="50" cy="40" r="18" fill="#FBD5B5" />
    {/* Hair */}
    <path d="M33 36C33 24 40 18 50 18C60 18 67 24 67 36C63 27 57 23 50 23C43 23 37 27 33 36Z" fill="#1E293B" />
    {/* Glasses */}
    <rect x="39" y="36" width="9" height="7" rx="2" fill="none" stroke="#4C1D95" strokeWidth="1.5" />
    <rect x="52" y="36" width="9" height="7" rx="2" fill="none" stroke="#4C1D95" strokeWidth="1.5" />
    <path d="M48 39H52" stroke="#4C1D95" strokeWidth="1.5" />
    {/* Eyes */}
    <circle cx="43.5" cy="39.5" r="1.3" fill="#1E293B" />
    <circle cx="56.5" cy="39.5" r="1.3" fill="#1E293B" />
    {/* Smile */}
    <path d="M46 47C48 49 52 49 54 47" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

