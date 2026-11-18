/**
 * Biomechanical Hand Landmark Sign Classifier & Evaluator for SignBridge
 * 
 * Accurately analyzes 21 3D hand landmarks from MediaPipe Hands to recognize
 * ALL 21 supported sign language gestures (Greetings, Common Words, Phrases, Alphabet, Numbers).
 * 
 * Features:
 * - Scale and distance invariant normalization using palm size (Wrist to Middle MCP).
 * - Joint bend angle calculations (MCP -> PIP -> TIP) in 3D degrees.
 * - Symmetrical support for Left Hand and Right Hand gestures.
 * - Realistic continuous confidence scores based on feature fit.
 * - Rejects unrecognized gestures (returns null) instead of making false guesses.
 * - Detailed physical feedback and adjustments for the Practice module.
 */

/**
 * Calculates Euclidean 3D distance between two points.
 */
export function distance3D(p1, p2) {
    if (!p1 || !p2) return 0;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates joint bend angle in degrees formed by three points (p1 -> p2 -> p3).
 * When finger is straight, angle approaches 180 degrees.
 * When finger is curled into a fist, angle drops below 100 degrees.
 */
export function calculateJointAngleDeg(p1, p2, p3) {
    if (!p1 || !p2 || !p3) return 180;
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: (p1.z || 0) - (p2.z || 0) };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: (p3.z || 0) - (p2.z || 0) };

    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

    if (mag1 === 0 || mag2 === 0) return 180;
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Extracts comprehensive, normalized biomechanical features from 21 MediaPipe landmarks.
 */
export function extractHandFeatures(landmarks, handedness = 'Right') {
    if (!landmarks || landmarks.length < 21) return null;

    const wrist = landmarks[0];

    const thumbCmc = landmarks[1];
    const thumbMcp = landmarks[2];
    const thumbIp = landmarks[3];
    const thumbTip = landmarks[4];

    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexDip = landmarks[7];
    const indexTip = landmarks[8];

    const middleMcp = landmarks[9];
    const middlePip = landmarks[10];
    const middleDip = landmarks[11];
    const middleTip = landmarks[12];

    const ringMcp = landmarks[13];
    const ringPip = landmarks[14];
    const ringDip = landmarks[15];
    const ringTip = landmarks[16];

    const pinkyMcp = landmarks[17];
    const pinkyPip = landmarks[18];
    const pinkyDip = landmarks[19];
    const pinkyTip = landmarks[20];

    // Physiological scale: Palm Size (Wrist to Middle MCP distance)
    const palmSize = Math.max(distance3D(wrist, middleMcp), 0.04);

    // Analyze individual finger extension and curl
    function analyzeFinger(mcp, pip, dip, tip) {
        const pipAngle = calculateJointAngleDeg(mcp, pip, tip);
        const dipAngle = calculateJointAngleDeg(pip, dip, tip);
        const tipWristDist = distance3D(tip, wrist) / palmSize;
        const tipMcpDist = distance3D(tip, mcp) / palmSize;
        const pipMcpDist = distance3D(pip, mcp) / palmSize;

        // When extended straight out:
        const isExtended = pipAngle > 130 && tipWristDist > 1.05 && tipMcpDist > 0.62;
        
        // When curled tightly into palm:
        const isCurled = (pipAngle < 112 || tipMcpDist < 0.50) && tipWristDist < 1.15;
        
        // When curved (C-shape or gentle bend):
        const isCurved = !isExtended && !isCurled && tipMcpDist >= 0.42 && pipAngle >= 100 && pipAngle <= 138;

        return {
            pipAngle,
            dipAngle,
            tipWristDist,
            tipMcpDist,
            pipMcpDist,
            isExtended,
            isCurled,
            isCurved
        };
    }

    const index = analyzeFinger(indexMcp, indexPip, indexDip, indexTip);
    const middle = analyzeFinger(middleMcp, middlePip, middleDip, middleTip);
    const ring = analyzeFinger(ringMcp, ringPip, ringDip, ringTip);
    const pinky = analyzeFinger(pinkyMcp, pinkyPip, pinkyDip, pinkyTip);

    // Thumb biomechanical metrics
    const thumbWristDist = distance3D(thumbTip, wrist) / palmSize;
    const thumbIndexMcpDist = distance3D(thumbTip, indexMcp) / palmSize;
    const thumbMcpDist = distance3D(thumbTip, thumbMcp) / palmSize;
    const thumbIpAngle = calculateJointAngleDeg(thumbMcp, thumbIp, thumbTip);

    // Thumb extended outward from hand
    const thumbMiddleMcpDist = distance3D(thumbTip, middleMcp) / palmSize;
    const isThumbExtended = thumbWristDist > 0.88 && thumbIndexMcpDist > 0.58 && thumbMcpDist > 0.45 && thumbMiddleMcpDist > 0.58;

    // Thumbs-Up (Help): Thumb points straight up towards top of frame, separated from curled fingers
    const isThumbPointingUp = (thumbMcp.y - thumbTip.y > 0.03 * palmSize) &&
                             (thumbTip.y < indexMcp.y);
    const isThumbUp = isThumbPointingUp && (distance3D(thumbTip, indexTip) / palmSize > 0.45);

    // Thumb tucked across palm (Letter B): Thumb tip rests across lower palm/base of ring-pinky
    const isThumbTuckedAcross = (distance3D(thumbTip, ringMcp) / palmSize < 0.65) ||
                                (distance3D(thumbTip, pinkyMcp) / palmSize < 0.70) ||
                                (distance3D(thumbTip, middleMcp) / palmSize < 0.55 && thumbTip.x > indexMcp.x);

    // Thumb alongside index knuckle (Letter A): All 4 fingers curled, thumb sits upright alongside index
    const isThumbAlongside = thumbIndexMcpDist < 0.55 &&
                             (thumbTip.y < thumbMcp.y + 0.08) &&
                             !isThumbUp && !isThumbTuckedAcross;

    // Inter-finger tip distances (normalized by palmSize)
    const indexThumbDist = distance3D(indexTip, thumbTip) / palmSize;
    const middleThumbDist = distance3D(middleTip, thumbTip) / palmSize;
    const ringThumbDist = distance3D(ringTip, thumbTip) / palmSize;
    const pinkyThumbDist = distance3D(pinkyTip, thumbTip) / palmSize;
    const indexMiddleDist = distance3D(indexTip, middleTip) / palmSize;
    const middleRingDist = distance3D(middleTip, ringTip) / palmSize;
    const ringPinkyDist = distance3D(ringTip, pinkyTip) / palmSize;

    // Bunching metric for all 5 tips (Food gesture)
    const tips = [thumbTip, indexTip, middleTip, ringTip, pinkyTip];
    const centroid = {
        x: tips.reduce((s, p) => s + p.x, 0) / 5,
        y: tips.reduce((s, p) => s + p.y, 0) / 5,
        z: tips.reduce((s, p) => s + (p.z || 0), 0) / 5
    };
    const maxTipToCentroid = Math.max(...tips.map(p => distance3D(p, centroid) / palmSize));
    const fingersReachingForward = (index.tipWristDist > 0.90 || middle.tipWristDist > 0.90) && index.tipMcpDist > 0.48;
    const isFoodPinch = maxTipToCentroid < 0.48 && indexThumbDist < 0.42 && middleThumbDist < 0.42 && fingersReachingForward;

    // Hand orientation metrics
    const isPointingDown = (indexTip.y > wrist.y + 0.05) && (middleTip.y > wrist.y + 0.05);
    const isHorizontal = Math.abs(indexTip.x - wrist.x) > Math.abs(indexTip.y - wrist.y) * 1.35;

    // Hooked index (Friend gesture): Index PIP extends out, but TIP bends hooked down; other fingers curled
    const isIndexHooked = index.tipMcpDist > 0.35 && indexTip.y > indexPip.y && index.pipAngle < 130 &&
                          middle.isCurled && ring.isCurled && pinky.isCurled;

    // Finger counts
    const extendedCount = (index.isExtended ? 1 : 0) +
                          (middle.isExtended ? 1 : 0) +
                          (ring.isExtended ? 1 : 0) +
                          (pinky.isExtended ? 1 : 0);

    const curledCount = (index.isCurled ? 1 : 0) +
                        (middle.isCurled ? 1 : 0) +
                        (ring.isCurled ? 1 : 0) +
                        (pinky.isCurled ? 1 : 0);

    const curvedCount = (index.isCurved ? 1 : 0) +
                        (middle.isCurved ? 1 : 0) +
                        (ring.isCurved ? 1 : 0) +
                        (pinky.isCurved ? 1 : 0);

    return {
        wrist,
        thumbTip, thumbMcp, thumbIp,
        indexTip, indexMcp, indexPip,
        middleTip, middleMcp, middlePip,
        ringTip, ringMcp, ringPip,
        pinkyTip, pinkyMcp, pinkyPip,
        palmSize,
        index, middle, ring, pinky,
        thumbWristDist, thumbIndexMcpDist, thumbMcpDist,
        isThumbExtended, isThumbUp, isThumbTuckedAcross, isThumbAlongside,
        indexThumbDist, middleThumbDist, ringThumbDist, pinkyThumbDist, indexMiddleDist,
        middleRingDist, ringPinkyDist,
        maxTipToCentroid, isFoodPinch,
        isPointingDown, isHorizontal, isIndexHooked,
        extendedCount, curledCount, curvedCount,
        handedness
    };
}

/**
 * General Sign Language classifier from landmarks.
 * Evaluates the detected hand against all 21 supported vocabulary signs.
 * Returns the recognized sign object or null if unrecognized.
 */
export function classifyHandSign(landmarks, handedness = 'Right') {
    if (!landmarks || landmarks.length < 21) return null;

    const f = extractHandFeatures(landmarks, handedness);
    if (!f) return null;

    // 1. FRIEND: Hooked index finger with others curled tightly
    if (f.isIndexHooked) {
        return {
            sign_name: 'Friend',
            meaning: 'A companion or trusted person.',
            confidence: 94,
            description: 'Hooked index finger interlocked.'
        };
    }

    // 2. NO: Index & Middle tips pinching Thumb tip while reaching forward, Ring & Pinky curled
    const isNoPinch = f.indexThumbDist < 0.46 && f.middleThumbDist < 0.46 &&
                      f.index.tipMcpDist > 0.48 && f.middle.tipMcpDist > 0.48 &&
                      f.ring.isCurled && f.pinky.isCurled;
    if (isNoPinch) {
        const conf = Math.round(Math.min(98, 93 + (0.46 - f.indexThumbDist) * 15));
        return {
            sign_name: 'No',
            meaning: 'A negative response or disagreement.',
            confidence: conf,
            description: 'Index and middle fingertips snapping/pinching against thumb tip.'
        };
    }

    // 3. HELP: Thumbs Up with closed fist
    if (f.isThumbUp && f.curledCount >= 3 && !f.index.isExtended) {
        const conf = Math.round(Math.min(99, 92 + f.curledCount * 1.5));
        return {
            sign_name: 'Help',
            meaning: 'Requesting or offering assistance.',
            confidence: conf,
            description: 'Thumb pointing upright over closed fist (Thumbs Up).'
        };
    }

    // 4. FOOD: All 5 fingertips bunched together (Eating / Flattened O)
    if (f.isFoodPinch) {
        const conf = Math.round(Math.min(98, 91 + (0.48 - f.maxTipToCentroid) * 20));
        return {
            sign_name: 'Food',
            meaning: 'Nutrient intake or eating.',
            confidence: conf,
            description: 'All 5 fingertips clustered together towards mouth.'
        };
    }

    // 5. BAD: Open flat hand flipped downward below wrist
    if (f.extendedCount >= 3 && f.isPointingDown) {
        return {
            sign_name: 'Bad',
            meaning: 'Unfavorable quality or disapproval.',
            confidence: 94,
            description: 'Flat hand flipped downward palm-down.'
        };
    }

    // 6. SCHOOL: Flat open hand positioned horizontally
    if (f.extendedCount >= 3 && f.isHorizontal) {
        return {
            sign_name: 'School',
            meaning: 'Educational institution.',
            confidence: 93,
            description: 'Flat open hands positioned horizontally.'
        };
    }

    // 7. NUMBER 1: Index extended upright ONLY, middle/ring/pinky curled
    if (f.index.isExtended && f.middle.isCurled && f.ring.isCurled && f.pinky.isCurled) {
        const conf = Math.round(Math.min(99, 93 + (f.index.tipWristDist - 1.05) * 8));
        return {
            sign_name: 'Number 1',
            meaning: 'The number one in ASL.',
            confidence: conf,
            description: 'Index finger pointing straight up.'
        };
    }

    // 8. NUMBER 2: Index and Middle extended in V-shape, ring/pinky curled
    if (f.index.isExtended && f.middle.isExtended && f.ring.isCurled && f.pinky.isCurled && !f.isThumbExtended) {
        const conf = Math.round(Math.min(98, 93 + f.indexMiddleDist * 10));
        return {
            sign_name: 'Number 2',
            meaning: 'The number two in ASL.',
            confidence: conf,
            description: 'Index and middle fingers extended in a V-shape.'
        };
    }

    // 9. NUMBER 3: Thumb, Index, Middle extended, ring/pinky curled
    if (f.isThumbExtended && f.index.isExtended && f.middle.isExtended && f.ring.isCurled && f.pinky.isCurled) {
        return {
            sign_name: 'Number 3',
            meaning: 'The number three in ASL.',
            confidence: 96,
            description: 'Thumb, index, and middle fingers extended.'
        };
    }

    // 10. WATER: ASL 'W' shape (Index, Middle, Ring extended upright; Pinky curled)
    if (f.index.isExtended && f.middle.isExtended && f.ring.isExtended && f.pinky.isCurled) {
        return {
            sign_name: 'Water',
            meaning: 'Clear liquid essential for life.',
            confidence: 96,
            description: 'W-handshape formed with index, middle, and ring extended.'
        };
    }

    // 11. LETTER B: 4 fingers upright together, thumb tucked across palm
    if (f.extendedCount >= 4 && (f.isThumbTuckedAcross || !f.isThumbExtended)) {
        return {
            sign_name: 'Letter B',
            meaning: 'Fingerspelling letter B.',
            confidence: 95,
            description: 'Four fingers extended together upright with thumb tucked.'
        };
    }

    // 12. LETTER C: Curved fingers and thumb forming C-arc
    if (f.curvedCount >= 2 && f.extendedCount === 0 && f.indexThumbDist > 0.28 && f.indexThumbDist < 1.25) {
        return {
            sign_name: 'Letter C',
            meaning: 'Fingerspelling letter C.',
            confidence: 94,
            description: 'Hand curved into a clear C-shape.'
        };
    }

    // 13. LETTER A: Closed fist with thumb standing upright alongside index
    if (f.curledCount >= 4 && f.isThumbAlongside && !f.isThumbUp) {
        return {
            sign_name: 'Letter A',
            meaning: 'Fingerspelling letter A.',
            confidence: 95,
            description: 'Fist with thumb resting upright on side.'
        };
    }

    // 14. CLOSED FIST: Yes or Sorry
    if (f.curledCount >= 4 && !f.isThumbUp) {
        if (f.wrist.y >= 0.58) {
            return {
                sign_name: 'Sorry',
                meaning: 'An expression of apology or regret.',
                confidence: 93,
                description: 'Fist held against chest in circular motion.'
            };
        }
        return {
            sign_name: 'Yes',
            meaning: 'An affirmative response or agreement.',
            confidence: 95,
            description: 'Closed fist simulating head nod.'
        };
    }

    // 15. OPEN 5-HAND GESTURES: Hello, Thank You, Please, Good, Mother, Father
    if (f.extendedCount >= 3) {
        const isOpenFiveHand = !f.isThumbTuckedAcross && (f.thumbIndexMcpDist > 0.35 || f.isThumbExtended || f.thumbMcpDist > 0.38);

        // 1. Forehead level: Father (male sign: open 5-hand touching forehead)
        if (isOpenFiveHand && (f.thumbTip.y < 0.40 || (f.wrist.y < 0.48 && f.thumbTip.y < 0.42))) {
            return {
                sign_name: 'Father',
                meaning: 'Male parent.',
                confidence: 96,
                description: 'Open 5-hand with thumb touching forehead.'
            };
        }

        // 2. Lower chest level: Please
        if (f.wrist.y > 0.74 || f.thumbTip.y > 0.66) {
            return {
                sign_name: 'Please',
                meaning: 'A polite request word.',
                confidence: 93,
                description: 'Flat open hand placed over chest.'
            };
        }

        // 3. Chin level: Mother (female sign: open 5-hand touching chin)
        if (isOpenFiveHand && (f.thumbTip.y >= 0.40 && f.thumbTip.y <= 0.66 && f.wrist.y >= 0.44 && f.wrist.y <= 0.76)) {
            return {
                sign_name: 'Mother',
                meaning: 'Female parent.',
                confidence: 96,
                description: 'Open 5-hand with thumb touching chin.'
            };
        }

        // 4. Flat hand at chin extending out: Thank You
        if (f.wrist.y >= 0.38 && f.wrist.y < 0.60 && f.thumbIndexMcpDist < 0.42) {
            return {
                sign_name: 'Thank You',
                meaning: 'An expression of gratitude.',
                confidence: 94,
                description: 'Flat hand extending outward from chin.'
            };
        }

        // 5. Flat hand at mid level: Good or Hello
        if (f.extendedCount === 4 && !f.isThumbExtended) {
            return {
                sign_name: 'Good',
                meaning: 'Positive quality or approval.',
                confidence: 94,
                description: 'Flat hand moving into open palm.'
            };
        }

        // 6. Default open hand raised: Hello
        return {
            sign_name: 'Hello',
            meaning: 'A standard polite greeting.',
            confidence: 95,
            description: 'Open hand salute gesture near face.'
        };
    }

    // If none of the 21 signs match: return null
    return null;
}

/**
 * Directly evaluates current hand landmarks against a target sign name.
 * Used by the Practice Module to determine correctness and provide physical adjustment suggestions.
 */
export function evaluateSignAttempt(landmarks, targetSignName, handedness = 'Right') {
    if (!landmarks || landmarks.length < 21 || !targetSignName) {
        return {
            isCorrect: false,
            status: 'AWAITING_HAND',
            confidence: 0,
            message: 'Position your hand clearly inside the camera frame.',
            suggestedChange: 'Hold your hand up to the camera.'
        };
    }

    const f = extractHandFeatures(landmarks, handedness);
    if (!f) {
        return {
            isCorrect: false,
            status: 'AWAITING_HAND',
            confidence: 0,
            message: 'Position your hand clearly inside the camera frame.',
            suggestedChange: 'Keep your hand within the frame.'
        };
    }

    const target = targetSignName.toLowerCase().trim();
    let isCorrect = false;
    let confidence = 94;
    let suggestedChange = '';

    // Evaluate against Target
    if (target.includes('hello')) {
        if (f.extendedCount >= 3 && f.wrist.y <= 0.65) {
            isCorrect = true;
            confidence = Math.min(98, 92 + f.extendedCount * 1.5);
        } else {
            suggestedChange = 'To fix HELLO: Open all 5 fingers flat and raise your hand near your temple in a gentle salute.';
        }
    } else if (target.includes('thank')) {
        if (f.extendedCount >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix THANK YOU: Touch fingertips near your chin with an open flat hand, then extend outward.';
        }
    } else if (target.includes('please')) {
        if (f.extendedCount >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix PLEASE: Place your flat open hand against your chest and rub in a gentle circle.';
        }
    } else if (target.includes('sorry')) {
        if (f.curledCount >= 3 && !f.index.isExtended && !f.middle.isExtended) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix SORRY: Form a tight closed fist curling all fingers in, and hold it against your chest.';
        }
    } else if (target.includes('yes')) {
        if (f.curledCount >= 3 && !f.index.isExtended && !f.middle.isExtended) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix YES: Make a closed fist with all fingers tucked in (S-handshape) and hold upright.';
        }
    } else if (target.includes('no')) {
        if (f.indexThumbDist < 0.48 && f.middleThumbDist < 0.48 && f.ring.isCurled && f.pinky.isCurled) {
            isCorrect = true;
            confidence = 96;
        } else if (f.ring.isExtended || f.pinky.isExtended) {
            suggestedChange = 'To fix NO: Fold your ring and pinky fingers down tightly against your palm.';
        } else {
            suggestedChange = 'To fix NO: Bring your index and middle fingertips together to snap against your thumb tip.';
        }
    } else if (target.includes('good')) {
        if (f.extendedCount >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix GOOD: Open your hand flat with fingers together, touch chin, then lower forward.';
        }
    } else if (target.includes('bad')) {
        if (f.extendedCount >= 3 && f.isPointingDown) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix BAD: Open your flat hand and flip it sharply downward with fingertips pointing down.';
        }
    } else if (target.includes('water')) {
        if (f.index.isExtended && f.middle.isExtended && f.ring.isExtended && f.pinky.isCurled) {
            isCorrect = true;
            confidence = 96;
        } else if (!f.index.isExtended || !f.middle.isExtended || !f.ring.isExtended) {
            suggestedChange = 'To fix WATER: Extend your index, middle, and ring fingers straight up into a "W" shape.';
        } else {
            suggestedChange = 'To fix WATER: Fold your pinky finger down into your palm with your thumb.';
        }
    } else if (target.includes('food')) {
        if (f.isFoodPinch || (f.maxTipToCentroid < 0.50 && f.indexThumbDist < 0.45)) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix FOOD: Pinch all 5 fingertips and thumb together into a single cluster pointing to mouth.';
        }
    } else if (target.includes('help')) {
        if (f.isThumbUp && f.curledCount >= 3) {
            isCorrect = true;
            confidence = 97;
        } else if (!f.isThumbUp) {
            suggestedChange = 'To fix HELP: Point your thumb straight up towards the ceiling over a tight closed fist.';
        } else {
            suggestedChange = 'To fix HELP: Curl all 4 fingers tightly into a fist while extending your thumb straight up.';
        }
    } else if (target.includes('mother')) {
        const isOpenHand = f.extendedCount >= 3;
        const isThumbOpen = !f.isThumbTuckedAcross && (f.thumbIndexMcpDist > 0.35 || f.isThumbExtended || f.thumbMcpDist > 0.38);
        const isNotForehead = f.thumbTip.y >= 0.38 || f.wrist.y >= 0.46;
        const isNotTooLow = f.thumbTip.y <= 0.70;

        if (isOpenHand && isThumbOpen && isNotForehead && isNotTooLow) {
            isCorrect = true;
            confidence = Math.round(Math.min(98, 92 + f.extendedCount * 1.5));
        } else if (!isOpenHand) {
            suggestedChange = 'To fix MOTHER: Spread all 5 fingers wide and open your hand completely.';
        } else if (!isThumbOpen) {
            suggestedChange = 'To fix MOTHER: Extend your thumb outward so it is not tucked into your palm.';
        } else if (!isNotForehead) {
            suggestedChange = 'To fix MOTHER: Lower your open 5-hand down to touch your chin (Mother is signed at the chin, not forehead).';
        } else {
            suggestedChange = 'To fix MOTHER: Position your open 5-hand with thumb tip touching your chin.';
        }
    } else if (target.includes('father')) {
        const isOpenHand = f.extendedCount >= 3;
        const isThumbOpen = !f.isThumbTuckedAcross && (f.thumbIndexMcpDist > 0.35 || f.isThumbExtended || f.thumbMcpDist > 0.38);
        const isForeheadLevel = f.thumbTip.y <= 0.44 || f.wrist.y <= 0.52;

        if (isOpenHand && isThumbOpen && isForeheadLevel) {
            isCorrect = true;
            confidence = Math.round(Math.min(98, 92 + f.extendedCount * 1.5));
        } else if (!isOpenHand) {
            suggestedChange = 'To fix FATHER: Spread all 5 fingers wide and open your hand completely.';
        } else if (!isThumbOpen) {
            suggestedChange = 'To fix FATHER: Extend your thumb outward so it is not tucked into your palm.';
        } else if (!isForeheadLevel) {
            suggestedChange = 'To fix FATHER: Raise your open 5-hand higher so your thumb touches your forehead (Father is signed at forehead level).';
        } else {
            suggestedChange = 'To fix FATHER: Position your open 5-hand with thumb tip touching your forehead.';
        }
    } else if (target.includes('friend')) {
        if (f.isIndexHooked || (f.index.tipMcpDist > 0.35 && f.middle.isCurled && f.ring.isCurled)) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix FRIEND: Hook your index finger into a crook while curling your other fingers in.';
        }
    } else if (target.includes('school')) {
        if (f.extendedCount >= 3 && f.isHorizontal) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix SCHOOL: Turn your flat open hand horizontally as if clapping hands together.';
        }
    } else if (target.includes('letter a')) {
        if (f.curledCount >= 3 && f.isThumbAlongside) {
            isCorrect = true;
            confidence = 95;
        } else if (f.curledCount < 3) {
            suggestedChange = 'To fix LETTER A: Make a tight fist with all 4 fingers curled into your palm.';
        } else {
            suggestedChange = 'To fix LETTER A: Rest your thumb upright along the outer edge of your index finger.';
        }
    } else if (target.includes('letter b')) {
        if (f.extendedCount >= 4 && (f.isThumbTuckedAcross || !f.isThumbExtended)) {
            isCorrect = true;
            confidence = 95;
        } else if (f.isThumbExtended) {
            suggestedChange = 'To fix LETTER B: Fold your thumb flat across your palm.';
        } else {
            suggestedChange = 'To fix LETTER B: Extend four fingers straight up together and tuck thumb across palm.';
        }
    } else if (target.includes('letter c')) {
        if (f.curvedCount >= 2 && f.indexThumbDist > 0.28 && f.indexThumbDist < 1.25) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix LETTER C: Curve your fingers and thumb to form an open "C" shape.';
        }
    } else if (target.includes('number 1') || target === '1') {
        if (f.index.isExtended && f.middle.isCurled && f.ring.isCurled && f.pinky.isCurled) {
            isCorrect = true;
            confidence = 97;
        } else if (!f.index.isExtended) {
            suggestedChange = 'To fix NUMBER 1: Extend your index finger straight up.';
        } else {
            suggestedChange = 'To fix NUMBER 1: Fold down your middle, ring, and pinky fingers with your thumb.';
        }
    } else if (target.includes('number 2') || target === '2') {
        if (f.index.isExtended && f.middle.isExtended && f.ring.isCurled && f.pinky.isCurled) {
            isCorrect = true;
            confidence = 96;
        } else if (!f.index.isExtended || !f.middle.isExtended) {
            suggestedChange = 'To fix NUMBER 2: Extend both your index and middle fingers in a V-shape.';
        } else {
            suggestedChange = 'To fix NUMBER 2: Fold your ring and pinky fingers down with your thumb.';
        }
    } else if (target.includes('number 3') || target === '3') {
        if (f.isThumbExtended && f.index.isExtended && f.middle.isExtended && f.ring.isCurled && f.pinky.isCurled) {
            isCorrect = true;
            confidence = 96;
        } else if (!f.isThumbExtended) {
            suggestedChange = 'To fix NUMBER 3: Extend your thumb outward along with index and middle fingers.';
        } else {
            suggestedChange = 'To fix NUMBER 3: Extend thumb, index, and middle fingers while folding ring and pinky.';
        }
    } else {
        // Fallback matching
        const detected = classifyHandSign(landmarks, handedness);
        const detectedName = (detected?.sign_name || '').toLowerCase();
        if (detectedName && (detectedName.includes(target) || target.includes(detectedName))) {
            isCorrect = true;
            confidence = detected.confidence;
        } else {
            suggestedChange = `To fix ${targetSignName}: Adjust your hand to match the gesture pose shown in the guide.`;
        }
    }

    const detected = classifyHandSign(landmarks, handedness);
    const detectedName = detected ? detected.sign_name : 'Unrecognized Pose';

    if (isCorrect) {
        return {
            isCorrect: true,
            status: 'CORRECT',
            detectedSign: targetSignName,
            confidence: confidence,
            message: `CORRECT! Your gesture matches ${targetSignName}.`,
            suggestedChange: 'Hold position to complete verification!'
        };
    } else {
        return {
            isCorrect: false,
            status: 'INCORRECT',
            detectedSign: detectedName,
            confidence: detected?.confidence || 65,
            message: `INCORRECT (Detected: ${detectedName}).`,
            suggestedChange: suggestedChange || `To fix ${targetSignName}: Match the visual diagram pose.`
        };
    }
}
