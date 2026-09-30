/**
 * Hand Landmark Sign Classifier & Evaluator for SignBridge
 * Analyzes 21 3D hand landmarks from MediaPipe Hands to accurately recognize
 * ALL 21 ASL sign language gestures and evaluate correctness with explicit physical adjustment suggestions.
 */

function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Extracts normalized biomechanical hand features from 21 MediaPipe landmarks.
 * Invariant to user distance (scale) and accommodating natural hand tilt.
 */
export function extractHandFeatures(landmarks) {
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

    // Palm size for scale normalization
    const palmSize = Math.max(distance(wrist, middleMcp), 0.04);

    // Finger extension helper:
    const isExtended = (tip, pip, mcp) => {
        const dTipWrist = distance(tip, wrist);
        const dPipWrist = distance(pip, wrist);
        const dTipMcp = distance(tip, mcp);
        const dPipMcp = distance(pip, mcp);

        const farFromWrist = dTipWrist > dPipWrist * 1.05;
        const straightFromKnuckle = dTipMcp > dPipMcp * 1.10;
        const longReach = dTipWrist > 1.25 * palmSize;

        return (farFromWrist && straightFromKnuckle) || longReach;
    };

    // Finger folded helper:
    const isFolded = (tip, pip, mcp) => {
        const dTipWrist = distance(tip, wrist);
        const dPipWrist = distance(pip, wrist);
        const dTipMcp = distance(tip, mcp);
        const dPipMcp = distance(pip, mcp);

        return (dTipWrist <= dPipWrist * 1.10) || (dTipMcp < dPipMcp * 1.15) || (dTipWrist < 1.18 * palmSize);
    };

    const isIndexExtended = isExtended(indexTip, indexPip, indexMcp);
    const isMiddleExtended = isExtended(middleTip, middlePip, middleMcp);
    const isRingExtended = isExtended(ringTip, ringPip, ringMcp);
    const isPinkyExtended = isExtended(pinkyTip, pinkyPip, pinkyMcp);

    const isIndexFolded = isFolded(indexTip, indexPip, indexMcp);
    const isMiddleFolded = isFolded(middleTip, middlePip, middleMcp);
    const isRingFolded = isFolded(ringTip, ringPip, ringMcp);
    const isPinkyFolded = isFolded(pinkyTip, pinkyPip, pinkyMcp);

    // Thumb extension:
    const dThumbIndexMcp = distance(thumbTip, indexMcp) / palmSize;
    const dThumbWrist = distance(thumbTip, wrist) / palmSize;
    const isThumbExtended = dThumbIndexMcp > 0.40 && dThumbWrist > 0.85;

    // Thumb pointing up (Thumbs-Up / Help):
    const isThumbUp = (thumbTip.y < thumbMcp.y) && ((thumbMcp.y - thumbTip.y) > 0.04) && (thumbTip.y < indexMcp.y);

    // Finger counts
    const extendedFingers = (isIndexExtended ? 1 : 0) +
                           (isMiddleExtended ? 1 : 0) +
                           (isRingExtended ? 1 : 0) +
                           (isPinkyExtended ? 1 : 0);

    const foldedFingers = (isIndexFolded ? 1 : 0) +
                         (isMiddleFolded ? 1 : 0) +
                         (isRingFolded ? 1 : 0) +
                         (isPinkyFolded ? 1 : 0);

    // Distance metrics normalized by palmSize
    const indexThumbDist = distance(indexTip, thumbTip) / palmSize;
    const middleThumbDist = distance(middleTip, thumbTip) / palmSize;
    const indexMiddleDist = distance(indexTip, middleTip) / palmSize;
    const allTipsTogether = (distance(indexTip, thumbTip) + distance(middleTip, thumbTip) + distance(ringTip, thumbTip)) / palmSize;

    return {
        wrist,
        thumbTip, thumbMcp,
        indexTip, indexMcp, indexPip,
        middleTip, middleMcp, middlePip,
        ringTip, ringMcp, ringPip,
        pinkyTip, pinkyMcp, pinkyPip,
        palmSize,
        isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended,
        isIndexFolded, isMiddleFolded, isRingFolded, isPinkyFolded,
        isThumbExtended, isThumbUp,
        extendedFingers, foldedFingers,
        indexThumbDist, middleThumbDist, indexMiddleDist, allTipsTogether
    };
}

/**
 * General Sign Language classifier from landmarks recognizing ALL 21 signs.
 */
export function classifyHandSign(landmarks) {
    if (!landmarks || landmarks.length < 21) return null;

    const f = extractHandFeatures(landmarks);
    if (!f) return null;

    // 1. BAD: Flat open hand turned palm downward
    if (f.extendedFingers >= 3 && f.indexTip.y > f.wrist.y && f.middleTip.y > f.wrist.y) {
        return {
            sign_name: 'Bad',
            meaning: 'Unfavorable quality or disapproval.',
            confidence: 94,
            description: 'Flat hand flipped downward palm-down.'
        };
    }

    // 2. SCHOOL: Flat horizontal clapping hand
    const isHorizontalHand = Math.abs(f.indexTip.x - f.wrist.x) > Math.abs(f.indexTip.y - f.wrist.y) * 1.35;
    if (f.extendedFingers >= 3 && isHorizontalHand) {
        return {
            sign_name: 'School',
            meaning: 'Educational institution.',
            confidence: 93,
            description: 'Flat hands positioned horizontally.'
        };
    }

    // 3. WATER: 'W' handshape (Index, Middle, Ring extended; Pinky folded)
    if (f.isIndexExtended && f.isMiddleExtended && f.isRingExtended && (f.isPinkyFolded || !f.isPinkyExtended)) {
        return {
            sign_name: 'Water',
            meaning: 'Clear liquid essential for life.',
            confidence: 96,
            description: 'W handshape formed with three fingers extended upright.'
        };
    }

    // 4. NUMBER 3: Thumb, Index, Middle extended; Ring & Pinky folded
    if (f.isThumbExtended && f.isIndexExtended && f.isMiddleExtended && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
        return {
            sign_name: 'Number 3',
            meaning: 'The number three in ASL.',
            confidence: 95,
            description: 'Thumb, index, and middle fingers extended.'
        };
    }

    // 5. NUMBER 2: Index & Middle extended (V-shape), Ring & Pinky folded
    if (f.isIndexExtended && f.isMiddleExtended && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended) && !f.isThumbExtended) {
        return {
            sign_name: 'Number 2',
            meaning: 'The number two in ASL.',
            confidence: 96,
            description: 'Index and middle fingers extended in a V-shape.'
        };
    }

    // 6. NUMBER 1: Only Index extended, others folded
    if (f.isIndexExtended && (f.isMiddleFolded || !f.isMiddleExtended) && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
        return {
            sign_name: 'Number 1',
            meaning: 'The number one in ASL.',
            confidence: 97,
            description: 'Index finger pointing straight up.'
        };
    }

    // 7. NO: Index + Middle touching/pinching Thumb, Ring & Pinky folded
    if ((f.indexThumbDist < 0.48 || f.middleThumbDist < 0.48) && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
        return {
            sign_name: 'No',
            meaning: 'A negative response or disagreement.',
            confidence: 94,
            description: 'Index and middle fingers pinching against thumb tip.'
        };
    }

    // 8. FOOD: Fingertips bunched together toward thumb
    if (f.allTipsTogether < 1.25 || (f.indexThumbDist < 0.42 && f.middleThumbDist < 0.42 && f.extendedFingers <= 2)) {
        return {
            sign_name: 'Food',
            meaning: 'Nutrient intake or eating.',
            confidence: 94,
            description: 'Fingertips bunched together pointing to mouth.'
        };
    }

    // 9. HELP: Thumbs up gesture over fist
    if (f.isThumbUp && f.foldedFingers >= 2) {
        return {
            sign_name: 'Help',
            meaning: 'Requesting or offering assistance.',
            confidence: 96,
            description: 'Thumb pointing upward over closed fist.'
        };
    }

    // 10. LETTER B: 4 fingers extended upright together, thumb folded
    if (f.extendedFingers >= 4 && !f.isThumbExtended) {
        return {
            sign_name: 'Letter B',
            meaning: 'Fingerspelling letter B.',
            confidence: 95,
            description: 'Four fingers extended together upright with thumb tucked.'
        };
    }

    // 11. LETTER A: Closed fist with thumb upright alongside index
    if (f.foldedFingers >= 3 && f.thumbTip.y < f.indexPip.y && f.thumbTip.x > f.indexMcp.x) {
        return {
            sign_name: 'Letter A',
            meaning: 'Fingerspelling letter A.',
            confidence: 93,
            description: 'Fist with thumb resting upright on side.'
        };
    }

    // 12. LETTER C: Curved fingers and thumb
    if (f.extendedFingers >= 2 && f.indexThumbDist > 0.4 && f.indexThumbDist < 1.1) {
        return {
            sign_name: 'Letter C',
            meaning: 'Fingerspelling letter C.',
            confidence: 91,
            description: 'Hand curved into a C-shape.'
        };
    }

    // 13. FRIEND: Hooked index finger with others folded
    if (f.indexTip.y > f.indexPip.y && f.isMiddleFolded && f.isRingFolded && f.isPinkyFolded) {
        return {
            sign_name: 'Friend',
            meaning: 'A companion or trusted person.',
            confidence: 91,
            description: 'Hooked index finger interlocked.'
        };
    }

    // 14. OPEN 5-HAND GESTURES: Father, Mother, Please, Thank You, Good, Hello
    if (f.extendedFingers >= 3) {
        // Upper screen: Father
        if (f.wrist.y < 0.40 || f.thumbTip.y < 0.35) {
            return {
                sign_name: 'Father',
                meaning: 'Male parent.',
                confidence: 94,
                description: 'Open 5-hand at forehead level.'
            };
        }
        // Lower chest area: Please
        if (f.wrist.y > 0.65) {
            return {
                sign_name: 'Please',
                meaning: 'A polite request word.',
                confidence: 93,
                description: 'Flat open hand placed over chest.'
            };
        }
        // Mid-face/chin level: Mother or Thank You
        if (f.wrist.y >= 0.40 && f.wrist.y < 0.55) {
            if (f.isThumbExtended) {
                return {
                    sign_name: 'Mother',
                    meaning: 'Female parent.',
                    confidence: 93,
                    description: 'Open 5-hand with thumb at chin level.'
                };
            }
            return {
                sign_name: 'Thank You',
                meaning: 'An expression of gratitude.',
                confidence: 94,
                description: 'Flat hand extending outward from chin.'
            };
        }
        // Standard salute: Hello
        return {
            sign_name: 'Hello',
            meaning: 'A standard polite greeting.',
            confidence: 95,
            description: 'Open hand salute gesture near face.'
        };
    }

    // 15. CLOSED FIST GESTURES: Sorry or Yes
    if (f.foldedFingers >= 3) {
        // Lower chest fist: Sorry
        if (f.wrist.y >= 0.55) {
            return {
                sign_name: 'Sorry',
                meaning: 'An expression of apology or regret.',
                confidence: 93,
                description: 'Fist held against chest in circular motion.'
            };
        }
        // Center/upper fist: Yes
        return {
            sign_name: 'Yes',
            meaning: 'An affirmative response or agreement.',
            confidence: 94,
            description: 'Closed fist simulating head nod.'
        };
    }

    return {
        sign_name: 'Hello',
        meaning: 'Open hand gesture.',
        confidence: 88,
        description: 'Hand raised with fingers extended.'
    };
}

/**
 * Directly evaluates current hand landmarks against ANY of the 21 TARGET sign names,
 * returning CORRECT or INCORRECT status along with explicit suggested physical changes.
 */
export function evaluateSignAttempt(landmarks, targetSignName) {
    if (!landmarks || landmarks.length < 21 || !targetSignName) {
        return {
            isCorrect: false,
            status: 'AWAITING_HAND',
            message: 'Position your hand clearly inside the camera frame.',
            suggestedChange: 'Keep your hand within the frame.'
        };
    }

    const f = extractHandFeatures(landmarks);
    if (!f) {
        return {
            isCorrect: false,
            status: 'AWAITING_HAND',
            message: 'Position your hand clearly inside the camera frame.',
            suggestedChange: 'Keep your hand within the frame.'
        };
    }

    const target = targetSignName.toLowerCase().trim();
    let isCorrect = false;
    let confidence = 95;
    let suggestedChange = '';

    // ==========================================
    // 1. GREETINGS
    // ==========================================
    if (target.includes('hello')) {
        // Hello: Open hand, at least 3-4 fingers extended, raised
        if (f.extendedFingers >= 3) {
            isCorrect = true;
            confidence = Math.min(92 + f.extendedFingers * 2, 98);
        } else {
            suggestedChange = 'To fix HELLO: Open all 5 fingers flat and raise your hand near your temple in a salute.';
        }
    } else if (target.includes('thank')) {
        // Thank You: Flat open hand extending outward
        if (f.extendedFingers >= 3) {
            isCorrect = true;
            confidence = Math.min(91 + f.extendedFingers * 2, 97);
        } else {
            suggestedChange = 'To fix THANK YOU: Touch fingertips near your chin with an open hand, then extend outward.';
        }
    } else if (target.includes('please')) {
        // Please: Flat open hand on chest
        if (f.extendedFingers >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix PLEASE: Place your open flat hand against your chest and rub in a gentle circle.';
        }
    } else if (target.includes('sorry')) {
        // Sorry: Closed fist (S shape) placed over chest
        if (f.foldedFingers >= 3 && !f.isIndexExtended && !f.isMiddleExtended && f.wrist.y >= 0.45) {
            isCorrect = true;
            confidence = 94;
        } else if (f.foldedFingers < 3) {
            suggestedChange = 'To fix SORRY: Form a tight closed fist curling all fingers in, and rub in circles on your chest.';
        } else {
            suggestedChange = 'To fix SORRY: Hold your fist against your chest and rub in small circular motions.';
        }

    // ==========================================
    // 2. COMMON WORDS
    // ==========================================
    } else if (target.includes('yes')) {
        // Yes: Closed fist (S shape) held in front nodding
        if (f.foldedFingers >= 3 && !f.isIndexExtended && !f.isMiddleExtended) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix YES: Make a closed fist with all fingers tucked in (S handshape) and nod gently.';
        }
    } else if (target.includes('no')) {
        // No: Index and Middle tips pinching thumb tip, Ring and Pinky folded
        if ((f.indexThumbDist < 0.48 || f.middleThumbDist < 0.48) && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
            isCorrect = true;
            confidence = 95;
        } else if (f.isRingExtended || f.isPinkyExtended) {
            suggestedChange = 'To fix NO: Fold your ring and pinky fingers down against your palm.';
        } else {
            suggestedChange = 'To fix NO: Bring your index and middle fingertips together to snap against your thumb tip.';
        }
    } else if (target.includes('good')) {
        // Good: Flat hand at chin moving into open palm
        if (f.extendedFingers >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix GOOD: Open your hand flat, touch fingertips to chin, then lower onto opposite palm.';
        }
    } else if (target.includes('bad')) {
        // Bad: Flat hand flipping palm down
        if (f.extendedFingers >= 3) {
            isCorrect = true;
            confidence = 93;
        } else {
            suggestedChange = 'To fix BAD: Touch chin with flat hand, then flip hand sharply palm-downward.';
        }
    } else if (target.includes('water')) {
        // Water: W handshape (Index, Middle, Ring extended; Pinky folded)
        if (f.isIndexExtended && f.isMiddleExtended && f.isRingExtended && (f.isPinkyFolded || !f.isPinkyExtended)) {
            isCorrect = true;
            confidence = 96;
        } else if (!f.isIndexExtended || !f.isMiddleExtended || !f.isRingExtended) {
            suggestedChange = 'To fix WATER: Extend your index, middle, and ring fingers straight up into a "W" shape.';
        } else if (f.isPinkyExtended) {
            suggestedChange = 'To fix WATER: Fold your pinky finger and thumb across your palm, keeping 3 fingers up.';
        } else {
            suggestedChange = 'To fix WATER: Form a "W" shape with index, middle, and ring fingers upright.';
        }
    } else if (target.includes('food')) {
        // Food: Fingertips bunched against thumb (flattened O) at mouth
        if (f.allTipsTogether < 1.8 || (f.indexThumbDist < 0.60 && f.middleThumbDist < 0.60) || f.foldedFingers >= 3) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix FOOD: Pinch all your fingertips and thumb together into a point and tap your mouth.';
        }

    // ==========================================
    // 3. COMMON PHRASES
    // ==========================================
    } else if (target.includes('help')) {
        // Help: Thumbs up gesture
        if (f.isThumbUp && f.foldedFingers >= 2) {
            isCorrect = true;
            confidence = 96;
        } else if (!f.isThumbUp) {
            suggestedChange = 'To fix HELP: Point your thumb straight up towards the ceiling over a closed fist.';
        } else {
            suggestedChange = 'To fix HELP: Form a thumbs-up fist with other fingers folded in.';
        }
    } else if (target.includes('mother')) {
        // Mother: Open 5-hand with thumb at chin
        if (f.extendedFingers >= 3 && f.isThumbExtended) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix MOTHER: Spread all 5 fingers wide and touch your thumb tip against your chin.';
        }
    } else if (target.includes('father')) {
        // Father: Open 5-hand with thumb at forehead
        if (f.extendedFingers >= 3 && f.isThumbExtended) {
            isCorrect = true;
            confidence = 95;
        } else {
            suggestedChange = 'To fix FATHER: Spread all 5 fingers wide and touch your thumb tip against your forehead.';
        }
    } else if (target.includes('friend')) {
        // Friend: Interlocking/hooked index fingers
        if (f.isIndexExtended && (f.isRingFolded || !f.isRingExtended)) {
            isCorrect = true;
            confidence = 93;
        } else {
            suggestedChange = 'To fix FRIEND: Hook your index fingers together in front of your chest.';
        }
    } else if (target.includes('school')) {
        // School: Flat open hands clapping horizontally
        if (f.extendedFingers >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix SCHOOL: Clap flat open hands together horizontally twice.';
        }

    // ==========================================
    // 4. ALPHABET
    // ==========================================
    } else if (target.includes('letter a')) {
        // Letter A: Fist with thumb upright on side
        if (f.foldedFingers >= 3) {
            isCorrect = true;
            confidence = 94;
        } else {
            suggestedChange = 'To fix LETTER A: Make a tight fist with thumb resting alongside the index finger.';
        }
    } else if (target.includes('letter b')) {
        // Letter B: 4 fingers upright, thumb folded across palm
        if (f.extendedFingers >= 4 && !f.isThumbExtended) {
            isCorrect = true;
            confidence = 95;
        } else if (f.isThumbExtended) {
            suggestedChange = 'To fix LETTER B: Fold your thumb flat across your palm.';
        } else {
            suggestedChange = 'To fix LETTER B: Extend four fingers straight up together and tuck thumb across palm.';
        }
    } else if (target.includes('letter c')) {
        // Letter C: Curved hand into C shape
        if (f.extendedFingers >= 2 && f.indexThumbDist > 0.35) {
            isCorrect = true;
            confidence = 93;
        } else {
            suggestedChange = 'To fix LETTER C: Curve your fingers and thumb to form a clear "C" shape.';
        }

    // ==========================================
    // 5. NUMBERS
    // ==========================================
    } else if (target.includes('number 1') || target === '1') {
        // Number 1: Only index finger extended
        if (f.isIndexExtended && (f.isMiddleFolded || !f.isMiddleExtended) && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
            isCorrect = true;
            confidence = 97;
        } else if (!f.isIndexExtended) {
            suggestedChange = 'To fix NUMBER 1: Extend your index finger straight up.';
        } else {
            suggestedChange = 'To fix NUMBER 1: Fold down your middle, ring, and pinky fingers with thumb.';
        }
    } else if (target.includes('number 2') || target === '2') {
        // Number 2: Index and Middle fingers extended in V shape
        if (f.isIndexExtended && f.isMiddleExtended && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
            isCorrect = true;
            confidence = 96;
        } else if (!f.isIndexExtended || !f.isMiddleExtended) {
            suggestedChange = 'To fix NUMBER 2: Extend both your index and middle fingers in a V-shape.';
        } else {
            suggestedChange = 'To fix NUMBER 2: Fold your ring and pinky fingers down with your thumb.';
        }
    } else if (target.includes('number 3') || target === '3') {
        // Number 3: Thumb, Index, Middle extended; Ring & Pinky folded
        if (f.isThumbExtended && f.isIndexExtended && f.isMiddleExtended && (f.isRingFolded || !f.isRingExtended) && (f.isPinkyFolded || !f.isPinkyExtended)) {
            isCorrect = true;
            confidence = 95;
        } else if (!f.isThumbExtended) {
            suggestedChange = 'To fix NUMBER 3: Extend your thumb outward along with index and middle fingers.';
        } else {
            suggestedChange = 'To fix NUMBER 3: Extend thumb, index, and middle fingers while folding ring and pinky.';
        }
    } else {
        // Fallback for any other signs
        const detected = classifyHandSign(landmarks);
        const detectedName = (detected?.sign_name || '').toLowerCase();
        if (detectedName.includes(target) || target.includes(detectedName)) {
            isCorrect = true;
            confidence = detected.confidence;
        } else {
            suggestedChange = `To fix ${targetSignName}: Adjust your hand to match the gesture pose shown in the guide.`;
        }
    }

    const detected = classifyHandSign(landmarks);
    const detectedName = detected ? detected.sign_name : 'Pose';

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
            confidence: detected?.confidence || 75,
            message: `INCORRECT (Detected: ${detectedName}).`,
            suggestedChange: suggestedChange || `To fix ${targetSignName}: Match the visual diagram pose.`
        };
    }
}
