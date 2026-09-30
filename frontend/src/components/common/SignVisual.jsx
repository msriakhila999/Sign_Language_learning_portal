import React from 'react';

/**
 * Renders realistic, natural human hand finger illustrations for ASL sign language gestures.
 * Uses natural human hand contours, skin gradients, knuckle creases, and fingernails.
 */
export default function SignVisual({ signName, className = 'w-full h-full' }) {
    const name = (signName || '').toLowerCase().trim();

    // Shared SVG defs for realistic skin tone gradients and filters
    const renderDefs = () => (
        <defs>
            {/* Natural warm skin gradient */}
            <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDDFC8" />
                <stop offset="45%" stopColor="#F5BE9B" />
                <stop offset="100%" stopColor="#DB966F" />
            </linearGradient>
            
            {/* Shadow skin tone for palm depth & curled fingers */}
            <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E5A680" />
                <stop offset="100%" stopColor="#BA734B" />
            </linearGradient>

            {/* Fingernail gradient */}
            <linearGradient id="nail" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF2EB" />
                <stop offset="100%" stopColor="#F7D3C1" />
            </linearGradient>

            {/* Base hand gradient */}
            <linearGradient id="baseHand" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCE4D2" />
                <stop offset="100%" stopColor="#E2A279" />
            </linearGradient>

            {/* Drop shadow for 3D depth */}
            <filter id="handShadow" x="-10%" y="-10%" width="120%" height="125%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8B4513" floodOpacity="0.18" />
            </filter>
        </defs>
    );

    // 1. HELLO: Open human hand raised near face in salute
    if (name.includes('hello')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F8FAFC" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M75 210 L85 140 C85 130 95 125 110 120 L160 120 C175 125 180 135 180 150 L170 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* 4 Extended Fingers Upright Side-by-Side */}
                    {/* Index */}
                    <path d="M96 122 L96 45 C96 38 108 38 108 45 L109 120 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="99" y="42" width="7" height="9" rx="3.5" fill="url(#nail)" />
                    {/* Middle */}
                    <path d="M112 120 L113 35 C113 28 126 28 126 35 L127 120 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="116" y="32" width="8" height="10" rx="4" fill="url(#nail)" />
                    {/* Ring */}
                    <path d="M130 120 L131 42 C131 35 143 35 143 42 L144 120 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="134" y="39" width="7" height="9" rx="3.5" fill="url(#nail)" />
                    {/* Pinky */}
                    <path d="M147 122 L149 58 C149 52 160 52 160 58 L159 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="151" y="55" width="6" height="8" rx="3" fill="url(#nail)" />

                    {/* Extended Thumb */}
                    <path d="M85 145 C70 140 60 125 55 105 C50 95 62 90 70 100 C78 110 88 125 95 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="56" y="96" width="7" height="8" rx="3.5" fill="url(#nail)" />

                    {/* Palm crease lines */}
                    <path d="M98 145 C115 155 145 150 165 138" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <path d="M100 165 C120 170 150 162 162 155" stroke="#B8734A" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                </g>
                {/* Motion arrow */}
                <path d="M185 85 Q205 75 210 95" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
                <polygon points="214,92 208,103 202,96" fill="#2563EB" />
                <text x="120" y="230" textAnchor="middle" fill="#1E3A8A" fontSize="12" fontWeight="700">Open Hand Salute Pose</text>
            </svg>
        );
    }

    // 2. THANK YOU: Flat hand touching chin, extending outward
    if (name.includes('thank')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F0FDF4" />
                <g filter="url(#handShadow)">
                    {/* Lower face silhouette */}
                    <path d="M40 70 C40 105 60 120 85 120 C95 120 100 115 100 110" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
                    
                    {/* Hand starting at chin */}
                    <path d="M80 115 L145 130 C155 132 165 140 170 155 L160 210 L125 205 L115 145 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Extended fingers pointing outward */}
                    <path d="M80 115 C75 110 65 112 65 100 C65 92 78 92 85 100 L125 115 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <path d="M82 108 C78 102 70 104 70 94 C70 86 82 87 88 95 L130 112 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <path d="M87 103 C84 98 78 99 78 90 C78 82 88 84 94 92 L135 110 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <path d="M94 100 C92 94 86 95 86 87 C86 80 95 82 100 88 L140 108 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Thumb */}
                    <path d="M125 130 C118 122 108 120 102 125 C98 130 105 138 115 140 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2" />
                </g>
                {/* Movement Arrow */}
                <path d="M140 85 Q175 75 195 95" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
                <polygon points="200,92 195,102 188,96" fill="#059669" />
                <text x="120" y="230" textAnchor="middle" fill="#065F46" fontSize="12" fontWeight="700">Chin Touch → Extend Outward</text>
            </svg>
        );
    }

    // 3. WATER: 'W' handshape (Index, Middle, Ring extended upright; Pinky folded)
    if (name.includes('water')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EFF6FF" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M80 210 L88 145 C88 135 96 128 110 125 L150 125 C165 128 172 138 170 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Three 'W' Fingers Extended: Index, Middle, Ring */}
                    {/* Index Finger */}
                    <path d="M95 125 L92 48 C92 40 105 40 105 48 L108 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="94" y="44" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Middle Finger */}
                    <path d="M115 125 L120 38 C120 30 133 30 133 38 L128 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="122" y="34" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Ring Finger */}
                    <path d="M136 125 L146 48 C146 40 158 40 158 48 L148 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="148" y="44" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Folded Pinky tucked into palm */}
                    <path d="M152 128 C160 135 168 145 162 160 C155 170 145 165 142 150 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />
                    <rect x="156" y="142" width="6" height="7" rx="3" fill="url(#nail)" />

                    {/* Thumb holding folded pinky */}
                    <path d="M88 148 C95 140 115 145 135 150 C145 152 142 165 130 165 C115 165 98 162 88 155 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="132" y="152" width="7" height="8" rx="3.5" fill="url(#nail)" />
                </g>
                {/* W indicator tag */}
                <circle cx="195" cy="45" r="18" fill="#2563EB" />
                <text x="195" y="51" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">W</text>
                <text x="120" y="230" textAnchor="middle" fill="#1E3A8A" fontSize="12" fontWeight="700">'W' Handshape (Tap Chin)</text>
            </svg>
        );
    }

    // 4. YES: Closed fist (S handshape)
    if (name.includes('yes')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EEF2FF" />
                <g filter="url(#handShadow)">
                    {/* Wrist */}
                    <path d="M90 210 L95 165 L155 165 L160 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Closed Fist (curled 4 fingers) */}
                    <rect x="80" y="90" width="85" height="75" rx="24" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Knuckles & Finger Segments */}
                    <path d="M85 110 C92 110 92 135 85 135" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" />
                    <path d="M105 92 L105 140" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M125 92 L125 140" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M145 95 L145 140" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

                    {/* Thumb folded across the fingers */}
                    <path d="M80 135 C80 120 90 115 115 115 C135 115 145 125 140 138 C135 145 110 145 85 145 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="130" y="123" width="8" height="9" rx="3.5" fill="url(#nail)" />
                </g>
                {/* Nodding motion arrows */}
                <path d="M185 85 L185 65" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                <polygon points="185,60 180,70 190,70" fill="#4F46E5" />
                <path d="M185 155 L185 175" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                <polygon points="185,180 180,170 190,170" fill="#4F46E5" />
                <text x="120" y="230" textAnchor="middle" fill="#3730A3" fontSize="12" fontWeight="700">Closed Fist (Nodding Gesture)</text>
            </svg>
        );
    }

    // 5. NO: Index & Middle snapping against thumb
    if (name.includes('no')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FEF2F2" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M95 210 L100 160 C100 145 110 135 125 130 L160 140 L160 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Folded Ring and Pinky in palm */}
                    <path d="M135 135 C150 135 158 145 155 160 C150 170 140 165 135 155 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />
                    <path d="M148 140 C160 142 166 150 164 162 C160 172 152 168 148 160 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />

                    {/* Extended Index & Middle Angled Down to Meet Thumb */}
                    <path d="M110 130 L75 75 C70 68 82 62 88 68 L122 120 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="73" y="66" width="7" height="9" rx="3.5" transform="rotate(-30 73 66)" fill="url(#nail)" />

                    <path d="M120 128 L85 82 C80 75 92 69 98 75 L132 122 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="83" y="73" width="7" height="9" rx="3.5" transform="rotate(-30 83 73)" fill="url(#nail)" />

                    {/* Thumb Tip Touching/Pinching Index & Middle */}
                    <path d="M105 160 C90 155 80 140 75 115 C72 105 85 98 90 108 L115 150 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="76" y="103" width="8" height="8" rx="4" fill="url(#nail)" />

                    {/* Contact Pinch Circle */}
                    <circle cx="82" cy="90" r="12" fill="#DC2626" opacity="0.25" />
                    <circle cx="82" cy="90" r="5" fill="#DC2626" />
                </g>
                <text x="120" y="230" textAnchor="middle" fill="#991B1B" fontSize="12" fontWeight="700">Index + Middle Pinch Thumb</text>
            </svg>
        );
    }

    // 6. HELP: Thumbs Up Fist on Open Base Palm
    if (name.includes('help')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F0FDF4" />
                <g filter="url(#handShadow)">
                    {/* Base Open Flat Hand */}
                    <path d="M50 170 L170 170 C185 170 190 185 175 195 L60 195 C45 195 40 175 50 170 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <line x1="170" y1="178" x2="192" y2="178" stroke="#B36E46" strokeWidth="2" strokeLinecap="round" />

                    {/* Thumbs-Up Fist Resting on Base */}
                    {/* Fist Body */}
                    <rect x="90" y="110" width="65" height="58" rx="18" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Upright Thumb */}
                    <path d="M102 120 L102 52 C102 42 116 42 116 52 L116 120 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="105" y="48" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Folded fingers knuckle accents */}
                    <path d="M125 112 C132 112 148 115 150 125 C148 135 132 135 125 135" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" />
                    <path d="M125 128 C132 128 148 130 150 140 C148 150 132 150 125 150" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" />
                </g>
                {/* Upward Lift Arrow */}
                <path d="M185 140 L185 85" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                <polygon points="185,78 178,92 192,92" fill="#10B981" />
                <text x="120" y="230" textAnchor="middle" fill="#065F46" fontSize="12" fontWeight="700">Thumbs Up on Flat Palm (Lift)</text>
            </svg>
        );
    }

    // 7. NUMBER 1: One index finger extended straight up
    if (name.includes('number 1') || name === '1') {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FAF5FF" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M85 210 L90 155 C90 145 98 135 110 130 L150 130 C162 135 168 145 168 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Single Index Finger Pointing Up */}
                    <path d="M102 132 L102 40 C102 30 118 30 118 40 L118 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="106" y="35" width="8" height="11" rx="4" fill="url(#nail)" />

                    {/* Curled Middle, Ring, Pinky */}
                    <rect x="118" y="115" width="38" height="45" rx="14" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />
                    
                    {/* Thumb folded over curled fingers */}
                    <path d="M92 145 C98 135 115 138 132 140 C140 142 138 155 128 155 C115 155 102 152 92 150 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2" />
                    <rect x="126" y="142" width="7" height="8" rx="3.5" fill="url(#nail)" />
                </g>
                <circle cx="195" cy="45" r="18" fill="#9333EA" />
                <text x="195" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">1</text>
                <text x="120" y="230" textAnchor="middle" fill="#6B21A8" fontSize="12" fontWeight="700">Index Finger Pointing Upright</text>
            </svg>
        );
    }

    // 8. NUMBER 2: Index & Middle fingers in V shape (Peace sign)
    if (name.includes('number 2') || name === '2') {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EFF6FF" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M85 210 L90 155 C90 145 98 135 110 130 L150 130 C162 135 168 145 168 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* V-Shape: Index angled left, Middle angled right */}
                    {/* Index */}
                    <path d="M102 132 L88 45 C86 35 100 32 104 42 L116 130 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="89" y="38" width="8" height="11" rx="4" transform="rotate(-10 89 38)" fill="url(#nail)" />

                    {/* Middle */}
                    <path d="M116 130 L134 42 C138 32 152 35 150 45 L132 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="138" y="38" width="8" height="11" rx="4" transform="rotate(10 138 38)" fill="url(#nail)" />

                    {/* Curled Ring & Pinky */}
                    <rect x="120" y="118" width="36" height="42" rx="14" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />
                    
                    {/* Thumb tucked over */}
                    <path d="M92 145 C98 135 115 138 130 140 C138 142 136 155 125 155 C112 155 100 152 92 150 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2" />
                </g>
                <circle cx="195" cy="45" r="18" fill="#2563EB" />
                <text x="195" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">2</text>
                <text x="120" y="230" textAnchor="middle" fill="#1E40AF" fontSize="12" fontWeight="700">Index + Middle Extended (V-Shape)</text>
            </svg>
        );
    }

    // 9. NUMBER 3: Thumb, Index, Middle extended
    if (name.includes('number 3') || name === '3') {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EEF2FF" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M85 210 L92 155 C92 145 100 135 115 130 L155 130 C165 135 170 145 170 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Extended Thumb pointing sideways */}
                    <path d="M92 150 C75 145 55 130 50 110 C45 100 58 92 68 102 L95 135 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="52" y="102" width="7" height="9" rx="3.5" fill="url(#nail)" />

                    {/* Extended Index */}
                    <path d="M105 132 L105 45 C105 36 120 36 120 45 L120 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="108" y="40" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Extended Middle */}
                    <path d="M125 132 L132 40 C132 30 146 30 146 40 L138 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="135" y="35" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Folded Ring and Pinky */}
                    <rect x="140" y="115" width="28" height="42" rx="12" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />
                </g>
                <circle cx="195" cy="45" r="18" fill="#4F46E5" />
                <text x="195" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">3</text>
                <text x="120" y="230" textAnchor="middle" fill="#3730A3" fontSize="12" fontWeight="700">Thumb, Index, and Middle Extended</text>
            </svg>
        );
    }

    // 10. LETTER A: Fist with thumb upright alongside index
    if (name.includes('letter a')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FAF5FF" />
                <g filter="url(#handShadow)">
                    {/* Wrist */}
                    <path d="M90 210 L95 165 L155 165 L160 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Closed Fist of 4 Fingers */}
                    <rect x="95" y="90" width="70" height="75" rx="20" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Thumb Resting Upright Along Side of Index */}
                    <path d="M92 160 C80 155 72 135 72 105 C72 88 88 88 88 105 L92 160 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="76" y="92" width="8" height="10" rx="4" fill="url(#nail)" />

                    {/* Finger Knuckle Creases */}
                    <path d="M115 90 L115 135" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M135 90 L135 135" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M152 95 L152 135" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                </g>
                <circle cx="195" cy="45" r="18" fill="#7E22CE" />
                <text x="195" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">A</text>
                <text x="120" y="230" textAnchor="middle" fill="#6B21A8" fontSize="12" fontWeight="700">Fist with Thumb Upright on Side</text>
            </svg>
        );
    }

    // 11. LETTER B: 4 fingers upright together, thumb tucked across palm
    if (name.includes('letter b')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EFF6FF" />
                <g filter="url(#handShadow)">
                    {/* Palm & Wrist */}
                    <path d="M85 210 L92 145 C92 135 100 128 115 125 L160 125 C172 132 175 145 172 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* 4 Fingers Held Straight Together */}
                    <path d="M96 125 L96 42 C96 34 108 34 108 42 L109 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="99" y="38" width="7" height="9" rx="3.5" fill="url(#nail)" />

                    <path d="M112 125 L113 32 C113 24 126 24 126 32 L127 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="116" y="28" width="8" height="10" rx="4" fill="url(#nail)" />

                    <path d="M130 125 L131 38 C131 30 143 30 143 38 L144 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="134" y="34" width="7" height="9" rx="3.5" fill="url(#nail)" />

                    <path d="M147 125 L149 52 C149 45 160 45 160 52 L159 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="151" y="48" width="6" height="8" rx="3" fill="url(#nail)" />

                    {/* Thumb Tucked Horizontally Across Palm */}
                    <path d="M90 145 C95 138 115 140 140 145 C150 148 145 162 135 162 C115 162 98 158 90 152 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="136" y="148" width="7" height="8" rx="3.5" fill="url(#nail)" />
                </g>
                <circle cx="195" cy="45" r="18" fill="#1D4ED8" />
                <text x="195" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">B</text>
                <text x="120" y="230" textAnchor="middle" fill="#1E40AF" fontSize="12" fontWeight="700">4 Fingers Upright, Thumb Tucked</text>
            </svg>
        );
    }

    // 12. LETTER C: Curved fingers and thumb forming 'C'
    if (name.includes('letter c')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EEF2FF" />
                <g filter="url(#handShadow)">
                    {/* Wrist */}
                    <path d="M120 210 L125 165 C135 155 155 150 170 160 L165 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Smooth C-Curve Hand Form */}
                    {/* Upper Curved Fingers */}
                    <path d="M155 135 C155 110 140 70 105 60 C80 50 65 65 65 80 C65 92 82 85 100 95 C120 105 130 125 130 140 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="66" y="70" width="8" height="9" rx="4" transform="rotate(45 66 70)" fill="url(#nail)" />

                    {/* Lower Curved Thumb */}
                    <path d="M135 150 C125 165 110 180 85 180 C68 180 62 165 72 152 C82 140 100 152 118 145 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="68" y="160" width="8" height="9" rx="4" transform="rotate(-40 68 160)" fill="url(#nail)" />
                </g>
                <circle cx="195" cy="45" r="18" fill="#4338CA" />
                <text x="195" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">C</text>
                <text x="120" y="230" textAnchor="middle" fill="#3730A3" fontSize="12" fontWeight="700">Hand Curved into 'C' Silhouette</text>
            </svg>
        );
    }

    // 13. FOOD: Fingertips bunched together (flattened O)
    if (name.includes('food')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FFFBEB" />
                <g filter="url(#handShadow)">
                    {/* Wrist */}
                    <path d="M105 210 L110 155 L165 155 L170 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Bunched fingers pointing up/in towards mouth */}
                    <path d="M110 155 C100 135 90 95 80 65 C78 58 92 52 98 60 C105 75 115 115 125 140 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <path d="M125 145 C120 120 105 85 92 60 C90 52 105 48 112 55 C120 70 135 115 142 145 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Thumb meeting fingertips at a point */}
                    <path d="M155 155 C150 135 135 100 115 65 C110 58 122 52 128 60 C140 85 155 125 160 150 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Contact point highlight */}
                    <circle cx="102" cy="58" r="6" fill="#F59E0B" />
                </g>
                <text x="120" y="230" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="700">Fingertips Pinched to Mouth (Eating)</text>
            </svg>
        );
    }

    // 14. SORRY: Closed fist over chest in gentle circular motion (NOT an open hand!)
    if (name.includes('sorry')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FFF7ED" />
                <g filter="url(#handShadow)">
                    {/* Torso/Chest Outline Silhouette */}
                    <path d="M40 210 C40 160 70 140 100 135 M200 210 C200 160 170 140 140 135 M100 135 C110 145 130 145 140 135" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
                    
                    {/* Wrist & Forearm */}
                    <path d="M70 210 L85 160 L120 155 L105 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Closed Fist Placed Over Chest */}
                    <rect x="95" y="105" width="75" height="65" rx="20" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Folded Knuckles */}
                    <path d="M112 106 L112 145" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M130 106 L130 145" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M148 108 L148 145" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

                    {/* Thumb Folded Across Front of Fingers */}
                    <path d="M90 145 C90 130 100 125 130 125 C148 125 155 136 150 148 C142 155 120 155 95 155 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="140" y="132" width="8" height="9" rx="4" fill="url(#nail)" />
                </g>

                {/* Circular Rubbing Motion Arrows Over Chest */}
                <path d="M85 90 A45 45 0 1 1 80 135" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" fill="none" />
                <polygon points="82,82 89,95 78,92" fill="#EA580C" />

                <text x="120" y="230" textAnchor="middle" fill="#9A3412" fontSize="12" fontWeight="700">Fist on Chest (Circular Rubbing)</text>
            </svg>
        );
    }

    // 15. PLEASE: Open flat hand rubbing clockwise on chest
    if (name.includes('please')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F0FDF4" />
                <g filter="url(#handShadow)">
                    {/* Torso/Chest Reference Outline */}
                    <path d="M40 210 C40 160 70 140 100 135 M200 210 C200 160 170 140 140 135 M100 135 C110 145 130 145 140 135" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
                    
                    {/* Forearm angled onto chest */}
                    <path d="M65 210 L85 155 L120 150 L95 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Flat Open Hand Placed Flat Against Heart/Chest */}
                    <path d="M100 148 L145 130 C155 125 165 135 160 145 L115 165 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* 4 Extended Straight Fingers */}
                    <path d="M142 128 L175 105 C180 100 188 108 182 115 L150 138 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="175" y="102" width="7" height="9" rx="3.5" transform="rotate(-35 175 102)" fill="url(#nail)" />

                    <path d="M138 122 L178 92 C184 88 190 96 185 102 L145 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="178" y="90" width="7" height="9" rx="3.5" transform="rotate(-35 178 90)" fill="url(#nail)" />

                    <path d="M132 118 L170 82 C175 78 182 85 178 92 L140 128 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="170" y="80" width="7" height="9" rx="3.5" transform="rotate(-35 170 80)" fill="url(#nail)" />

                    <path d="M125 115 L155 75 C160 70 168 76 163 82 L135 122 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="155" y="72" width="6" height="8" rx="3" transform="rotate(-35 155 72)" fill="url(#nail)" />

                    {/* Thumb Outward */}
                    <path d="M102 155 C90 148 95 130 108 128 C115 128 120 138 112 148 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2" />
                </g>

                {/* Circular Rubbing Arrow */}
                <path d="M80 85 A42 42 0 1 1 75 130" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" fill="none" />
                <polygon points="78,78 84,90 73,88" fill="#16A34A" />

                <text x="120" y="230" textAnchor="middle" fill="#15803D" fontSize="12" fontWeight="700">Flat Palm on Chest (Circular Rub)</text>
            </svg>
        );
    }

    // 16. GOOD: Hand touches chin then drops onto palm of opposite hand
    if (name.includes('good')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F0FDF4" />
                <g filter="url(#handShadow)">
                    {/* Chin profile outline */}
                    <path d="M45 40 C45 65 60 80 85 80" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />

                    {/* Base Receiving Palm (Horizontal) */}
                    <path d="M60 175 L175 175 C185 175 188 190 175 195 L65 195 C50 195 48 175 60 175 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Dominant Hand Descending onto Base Palm */}
                    <path d="M90 130 L150 130 C162 135 168 145 165 165 L85 165 C80 145 82 135 90 130 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    
                    {/* Fingers extended forward */}
                    <path d="M150 130 L195 130 C202 130 202 142 195 142 L155 142 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="190" y="132" width="7" height="8" rx="3.5" fill="url(#nail)" />

                    <path d="M150 142 L198 142 C205 142 205 154 198 154 L158 154 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="193" y="144" width="7" height="8" rx="3.5" fill="url(#nail)" />
                </g>

                {/* Downward Arc Motion from Chin to Palm */}
                <path d="M95 75 Q135 75 145 115" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" fill="none" />
                <polygon points="145,122 140,110 150,110" fill="#16A34A" />

                {/* Approving Checkmark */}
                <circle cx="200" cy="45" r="18" fill="#16A34A" />
                <path d="M192 45 L198 51 L209 39" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                <text x="120" y="230" textAnchor="middle" fill="#15803D" fontSize="12" fontWeight="700">Chin Touch → Down into Base Palm</text>
            </svg>
        );
    }

    // 17. BAD: Hand touches chin then flips downward sharply
    if (name.includes('bad')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FEF2F2" />
                <g filter="url(#handShadow)">
                    {/* Chin profile outline */}
                    <path d="M45 45 C45 70 60 85 85 85" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />

                    {/* Hand flipped downward with palm pointing down */}
                    <path d="M85 125 L120 115 L150 135 L120 150 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* 4 Fingers Pointing Downward */}
                    <path d="M125 145 L125 190 C125 198 115 198 115 190 L115 145 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="117" y="185" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M135 142 L135 195 C135 202 125 202 125 195 L125 142 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="127" y="190" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M145 138 L145 190 C145 198 135 198 135 190 L135 138 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="137" y="185" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M152 135 L152 180 C152 188 144 188 144 180 L144 135 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="145" y="175" width="5" height="7" rx="2.5" fill="url(#nail)" />
                </g>

                {/* Flip Downward Rejection Arrow */}
                <path d="M100 80 Q160 85 165 125" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" fill="none" />
                <polygon points="165,132 159,120 170,120" fill="#DC2626" />

                <text x="120" y="230" textAnchor="middle" fill="#991B1B" fontSize="12" fontWeight="700">Chin Touch → Flip Downward Palm-Down</text>
            </svg>
        );
    }

    // 18. MOTHER: Open 5-hand with thumb touching chin
    if (name.includes('mother')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#FDF2F8" />
                <g filter="url(#handShadow)">
                    {/* Lower face / Chin Profile */}
                    <path d="M40 70 C40 120 65 145 95 145 C115 145 125 135 125 125" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="4 4" fill="none" />

                    {/* Open 5-Hand Facing Sideways with Thumb Touching Chin */}
                    <path d="M145 210 L150 155 C150 142 158 135 170 135 L195 145 L185 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Extended Thumb Touching Chin Tip */}
                    <path d="M150 150 L102 145 C94 145 94 135 102 135 L150 140 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="98" y="136" width="7" height="8" rx="3.5" fill="url(#nail)" />

                    {/* 4 Extended Upright Fingers Spread (5-Hand) */}
                    <path d="M165 135 L165 55 C165 48 176 48 176 55 L176 135 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="168" y="52" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M178 135 L182 45 C182 38 193 38 193 45 L188 135 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="184" y="42" width="7" height="9" rx="3.5" fill="url(#nail)" />

                    <path d="M190 138 L198 52 C198 45 208 45 208 52 L200 140 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="200" y="49" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M202 142 L212 68 C212 62 220 62 220 68 L210 145 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="213" y="65" width="5" height="7" rx="2.5" fill="url(#nail)" />

                    {/* Touch Highlight Circle at Chin */}
                    <circle cx="98" cy="140" r="10" fill="#DB2777" opacity="0.25" />
                    <circle cx="98" cy="140" r="5" fill="#DB2777" />
                </g>
                <text x="120" y="230" textAnchor="middle" fill="#BE185D" fontSize="12" fontWeight="700">Open 5-Hand (Thumb Tap on Chin)</text>
            </svg>
        );
    }

    // 19. FATHER: Open 5-hand with thumb touching forehead
    if (name.includes('father')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#EFF6FF" />
                <g filter="url(#handShadow)">
                    {/* Upper face / Forehead Profile */}
                    <path d="M45 130 C45 80 65 65 95 65 C115 65 125 72 125 80" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="4 4" fill="none" />

                    {/* Open 5-Hand with Thumb Touching Forehead */}
                    <path d="M145 170 L150 115 C150 102 158 95 170 95 L195 105 L185 170 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Extended Thumb Touching Forehead */}
                    <path d="M150 110 L102 75 C95 70 98 62 106 65 L152 100 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="98" y="65" width="8" height="7" rx="3.5" transform="rotate(15 98 65)" fill="url(#nail)" />

                    {/* 4 Extended Upright Fingers Spread (5-Hand) */}
                    <path d="M165 95 L165 25 C165 18 176 18 176 25 L176 95 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="168" y="22" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M178 95 L182 15 C182 8 193 8 193 15 L188 95 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="184" y="12" width="7" height="9" rx="3.5" fill="url(#nail)" />

                    <path d="M190 98 L198 22 C198 15 208 15 208 22 L200 100 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="200" y="19" width="6" height="8" rx="3" fill="url(#nail)" />

                    <path d="M202 102 L212 38 C212 32 220 32 220 38 L210 105 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="213" y="35" width="5" height="7" rx="2.5" fill="url(#nail)" />

                    {/* Touch Highlight Circle at Forehead */}
                    <circle cx="102" cy="70" r="10" fill="#2563EB" opacity="0.25" />
                    <circle cx="102" cy="70" r="5" fill="#2563EB" />
                </g>
                <text x="120" y="230" textAnchor="middle" fill="#1D4ED8" fontSize="12" fontWeight="700">Open 5-Hand (Thumb Tap on Forehead)</text>
            </svg>
        );
    }

    // 20. FRIEND: Two hands with interlocking hooked index fingers
    if (name.includes('friend')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F5F3FF" />
                <g filter="url(#handShadow)">
                    {/* Left Hand Wrist */}
                    <path d="M40 180 L80 135 L105 155 L65 200 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Left Hooked Index Finger (Arching Over) */}
                    <path d="M95 130 C95 95 130 95 135 125 C138 135 125 140 120 130 C118 115 105 115 105 135 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="126" y="128" width="7" height="8" rx="3.5" fill="url(#nail)" />

                    {/* Right Hand Wrist */}
                    <path d="M200 180 L160 135 L135 155 L175 200 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2.5" />

                    {/* Right Hooked Index Finger (Looping Under Left Hook) */}
                    <path d="M145 130 C145 165 110 165 105 135 C102 125 115 120 120 130 C122 145 135 145 135 125 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2.5" />
                    <rect x="107" y="125" width="7" height="8" rx="3.5" fill="url(#nail)" />

                    {/* Interlocking Link Highlight Spark */}
                    <circle cx="120" cy="130" r="8" fill="#7C3AED" opacity="0.3" />
                </g>
                <text x="120" y="230" textAnchor="middle" fill="#6D28D9" fontSize="12" fontWeight="700">Hooked Index Fingers Interlocked</text>
            </svg>
        );
    }

    // 21. SCHOOL: Two flat hands clapping together horizontally
    if (name.includes('school')) {
        return (
            <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                {renderDefs()}
                <rect width="240" height="240" rx="20" fill="#F0FDF4" />
                <g filter="url(#handShadow)">
                    {/* Lower Hand: Palm Facing Upward Horizontally */}
                    <path d="M50 155 L160 155 C175 155 180 170 165 175 L55 175 C42 175 42 155 50 155 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2.5" />
                    <path d="M160 155 L195 155 C202 155 202 165 195 165 L165 165 Z" fill="url(#skinShadow)" stroke="#B36E46" strokeWidth="2" />

                    {/* Upper Hand: Palm Facing Downward Clapping on Lower Palm */}
                    <path d="M60 115 L170 125 C185 125 185 142 170 145 L65 135 C52 135 50 115 60 115 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                    <path d="M170 125 L202 130 C208 130 208 140 202 142 L172 138 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2" />
                    <rect x="195" y="132" width="7" height="7" rx="3.5" fill="url(#nail)" />

                    {/* Clapping Horizontal Impact Marks */}
                    <line x1="120" y1="130" x2="120" y2="150" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                    <line x1="140" y1="130" x2="140" y2="150" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                    <line x1="160" y1="130" x2="160" y2="150" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                </g>
                <text x="120" y="230" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="700">Flat Hands Clapping Horizontally Twice</text>
            </svg>
        );
    }

    // Default Fallback: Natural Human Open Hand
    return (
        <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderDefs()}
            <rect width="240" height="240" rx="20" fill="#F8FAFC" />
            <g filter="url(#handShadow)">
                <path d="M80 210 L88 142 C88 132 96 125 110 122 L155 122 C168 128 175 138 172 210 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                <path d="M96 124 L96 45 C96 38 108 38 108 45 L109 122 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                <rect x="99" y="42" width="7" height="9" rx="3.5" fill="url(#nail)" />
                <path d="M112 122 L113 35 C113 28 126 28 126 35 L127 122 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                <rect x="116" y="32" width="8" height="10" rx="4" fill="url(#nail)" />
                <path d="M130 122 L131 42 C131 35 143 35 143 42 L144 122 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                <rect x="134" y="39" width="7" height="9" rx="3.5" fill="url(#nail)" />
                <path d="M147 124 L149 58 C149 52 160 52 160 58 L159 125 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                <rect x="151" y="55" width="6" height="8" rx="3" fill="url(#nail)" />
                <path d="M88 145 C72 140 58 125 55 105 C50 95 62 90 70 100 C78 110 88 125 95 132 Z" fill="url(#skin)" stroke="#B36E46" strokeWidth="2.5" />
                <rect x="56" y="96" width="7" height="8" rx="3.5" fill="url(#nail)" />
                <path d="M98 145 C115 155 145 150 165 138" stroke="#B8734A" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
            <text x="120" y="230" textAnchor="middle" fill="#1E3A8A" fontSize="12" fontWeight="700">Natural Hand ASL Gesture</text>
        </svg>
    );
}
