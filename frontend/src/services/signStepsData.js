/**
 * Step-by-step posing instructions for all 21 ASL signs in SignBridge.
 */

export const SIGN_STEPS = {
    // 1. Hello
    'hello': {
        sign_name: 'Hello',
        category: 'Greetings',
        meaning: 'A standard polite greeting used when meeting someone.',
        summary: 'Flat open hand salute moving outward near temple.',
        steps: [
            {
                step: 1,
                title: 'Open Flat Hand',
                instruction: 'Hold your hand open and flat with all fingers together.',
                fingerHint: 'Fingers straight, palm facing forward.'
            },
            {
                step: 2,
                title: 'Touch Temple / Brow',
                instruction: 'Bring your fingertips to the side of your forehead or temple.',
                fingerHint: 'Fingertips near brow level.'
            },
            {
                step: 3,
                title: 'Salute Outward',
                instruction: 'Move your flat hand a few inches forward and outward like a salute.',
                fingerHint: 'Hold steady in camera frame.'
            }
        ]
    },

    // 2. Thank You
    'thank you': {
        sign_name: 'Thank You',
        category: 'Greetings',
        meaning: 'An expression of gratitude and appreciation.',
        summary: 'Flat hand touches chin then moves outward toward person.',
        steps: [
            {
                step: 1,
                title: 'Fingertips on Chin',
                instruction: 'Place your flat fingertips gently against your chin or lower lip.',
                fingerHint: 'Fingers flat, palm facing your face.'
            },
            {
                step: 2,
                title: 'Extend Outward',
                instruction: 'Move your hand smoothly forward and slightly down toward the camera.',
                fingerHint: 'Palm ends up facing up and forward.'
            },
            {
                step: 3,
                title: 'Hold Position',
                instruction: 'Keep your open hand steady in front of you for a second.',
                fingerHint: 'Open flat hand facing forward.'
            }
        ]
    },

    // 3. Please
    'please': {
        sign_name: 'Please',
        category: 'Greetings',
        meaning: 'A polite request word.',
        summary: 'Flat open palm rubs in a gentle circle on your chest.',
        steps: [
            {
                step: 1,
                title: 'Open Hand on Chest',
                instruction: 'Place your flat open palm against the center of your chest.',
                fingerHint: 'Fingers open, palm flat against shirt.'
            },
            {
                step: 2,
                title: 'Rub in Circles',
                instruction: 'Rub your palm in a gentle clockwise circle over your chest.',
                fingerHint: 'Keep your palm flat against your chest.'
            },
            {
                step: 3,
                title: 'Hold Steady',
                instruction: 'Rest your open hand on your chest facing the camera.',
                fingerHint: 'Open palm resting on chest.'
            }
        ]
    },

    // 4. Sorry
    'sorry': {
        sign_name: 'Sorry',
        category: 'Greetings',
        meaning: 'An expression of apology or regret.',
        summary: 'Closed fist rubs in a gentle circle over your chest.',
        steps: [
            {
                step: 1,
                title: 'Make a Fist',
                instruction: 'Curl all fingers into a fist with your thumb across your knuckles.',
                fingerHint: 'Tight fist, no fingers sticking out.'
            },
            {
                step: 2,
                title: 'Place Fist on Chest',
                instruction: 'Hold the flat part of your fist against the center of your chest.',
                fingerHint: 'Fist resting against your chest.'
            },
            {
                step: 3,
                title: 'Rub in Circles',
                instruction: 'Move your fist in small circular motions against your chest.',
                fingerHint: 'Fist on chest = Sorry (NOT open hand).'
            }
        ]
    },

    // 5. Yes
    'yes': {
        sign_name: 'Yes',
        category: 'Common Words',
        meaning: 'An affirmative response or agreement.',
        summary: 'Closed fist nods up and down like a head nodding yes.',
        steps: [
            {
                step: 1,
                title: 'Make a Fist',
                instruction: 'Form a closed fist with your thumb wrapped over your fingers.',
                fingerHint: 'Knuckles facing forward.'
            },
            {
                step: 2,
                title: 'Hold at Chest Level',
                instruction: 'Hold your fist upright in the center of the camera view.',
                fingerHint: 'Keep your wrist loose.'
            },
            {
                step: 3,
                title: 'Nod Up and Down',
                instruction: 'Bend your wrist up and down twice, just like nodding your head.',
                fingerHint: 'Fist nods up and down.'
            }
        ]
    },

    // 6. No
    'no': {
        sign_name: 'No',
        category: 'Common Words',
        meaning: 'A negative response or disagreement.',
        summary: 'Index and middle fingers snap down against thumb tip.',
        steps: [
            {
                step: 1,
                title: 'Extend 2 Fingers + Thumb',
                instruction: 'Point your index and middle fingers out, with thumb pointing up to meet them.',
                fingerHint: 'Tuck your ring and pinky fingers in.'
            },
            {
                step: 2,
                title: 'Snap Together',
                instruction: 'Quickly pinch your index and middle fingertips against your thumb tip.',
                fingerHint: 'Like a bird beak snapping shut.'
            },
            {
                step: 3,
                title: 'Hold Closed',
                instruction: 'Hold the pinched fingers steady in front of the camera.',
                fingerHint: 'Index + middle touching thumb tip.'
            }
        ]
    },

    // 7. Good
    'good': {
        sign_name: 'Good',
        category: 'Common Words',
        meaning: 'Positive quality or approval.',
        summary: 'Touch chin with flat hand then drop into opposite open palm.',
        steps: [
            {
                step: 1,
                title: 'Touch Chin',
                instruction: 'Touch the fingertips of your flat hand to your chin.',
                fingerHint: 'Fingers together, palm facing your face.'
            },
            {
                step: 2,
                title: 'Base Palm Ready',
                instruction: 'Hold your other hand flat with palm facing up like a tray.',
                fingerHint: 'Non-dominant hand flat, palm-up.'
            },
            {
                step: 3,
                title: 'Drop onto Palm',
                instruction: 'Bring your top hand down so the back of it rests in your base palm.',
                fingerHint: 'Chin touch down into open palm.'
            }
        ]
    },

    // 8. Bad
    'bad': {
        sign_name: 'Bad',
        category: 'Common Words',
        meaning: 'Unfavorable quality or disapproval.',
        summary: 'Touch chin with flat hand then flip downward palm-down.',
        steps: [
            {
                step: 1,
                title: 'Touch Chin',
                instruction: 'Touch your flat fingers to your chin with palm facing you.',
                fingerHint: 'Fingers straight, touching chin.'
            },
            {
                step: 2,
                title: 'Flip Hand Down',
                instruction: 'Flip your hand sharply outward and downward away from your face.',
                fingerHint: 'Turn hand over so palm faces down.'
            },
            {
                step: 3,
                title: 'Hold Palm Down',
                instruction: 'End with your flat hand held low, palm pointing at the floor.',
                fingerHint: 'Flat hand pointing down.'
            }
        ]
    },

    // 9. Water
    'water': {
        sign_name: 'Water',
        category: 'Common Words',
        meaning: 'Clear liquid essential for life.',
        summary: 'Three-finger W handshape taps chin twice.',
        steps: [
            {
                step: 1,
                title: 'Make a "W" Shape',
                instruction: 'Extend your index, middle, and ring fingers straight up like a W.',
                fingerHint: 'Fold your pinky down with your thumb.'
            },
            {
                step: 2,
                title: 'Bring to Chin',
                instruction: 'Bring the side of your index finger to touch your chin.',
                fingerHint: 'Three fingers pointing straight up.'
            },
            {
                step: 3,
                title: 'Tap Twice',
                instruction: 'Tap your index finger lightly against your chin two times.',
                fingerHint: 'W-handshape tapping chin.'
            }
        ]
    },

    // 10. Food
    'food': {
        sign_name: 'Food',
        category: 'Common Words',
        meaning: 'Nutrient intake or eating.',
        summary: 'Bunched fingertips tap lips twice (eating motion).',
        steps: [
            {
                step: 1,
                title: 'Pinch All Fingers',
                instruction: 'Pinch all your fingertips and thumb together into a point (flattened O).',
                fingerHint: 'All fingertips touching thumb tip.'
            },
            {
                step: 2,
                title: 'Point to Mouth',
                instruction: 'Bring your bunched fingertips up directly in front of your lips.',
                fingerHint: 'Tips pointing toward mouth.'
            },
            {
                step: 3,
                title: 'Tap Lips Twice',
                instruction: 'Lightly tap your fingertips to your lips twice like eating food.',
                fingerHint: 'Punched fingers tapping lips.'
            }
        ]
    },

    // 11. Help
    'help': {
        sign_name: 'Help',
        category: 'Common Phrases',
        meaning: 'Requesting or offering assistance.',
        summary: 'Thumbs-up fist on flat open palm lifts upward.',
        steps: [
            {
                step: 1,
                title: 'Thumbs-Up Fist',
                instruction: 'Make a fist with your thumb pointing straight up (thumbs-up).',
                fingerHint: 'Thumb sticking straight up.'
            },
            {
                step: 2,
                title: 'Rest on Flat Palm',
                instruction: 'Place your thumbs-up fist on the flat palm of your other hand.',
                fingerHint: 'Bottom hand is flat palm-up.'
            },
            {
                step: 3,
                title: 'Lift Both Up',
                instruction: 'Lift both hands upward together a few inches.',
                fingerHint: 'Thumbs-up resting on palm and lifting.'
            }
        ]
    },

    // 12. Mother
    'mother': {
        sign_name: 'Mother',
        category: 'Common Phrases',
        meaning: 'Female parent.',
        summary: 'Open 5-hand with thumb tapping chin twice.',
        steps: [
            {
                step: 1,
                title: 'Open 5-Hand',
                instruction: 'Spread all 5 fingers open wide and upright.',
                fingerHint: 'All fingers spread apart.'
            },
            {
                step: 2,
                title: 'Touch Thumb to Chin',
                instruction: 'Touch the tip of your thumb against the side of your chin.',
                fingerHint: 'Thumb tip rests on chin.'
            },
            {
                step: 3,
                title: 'Tap Twice',
                instruction: 'Tap your thumb lightly against your chin twice.',
                fingerHint: 'Open 5-hand tapping chin = Mother.'
            }
        ]
    },

    // 13. Father
    'father': {
        sign_name: 'Father',
        category: 'Common Phrases',
        meaning: 'Male parent.',
        summary: 'Open 5-hand with thumb tapping forehead twice.',
        steps: [
            {
                step: 1,
                title: 'Open 5-Hand',
                instruction: 'Spread all 5 fingers open wide and upright.',
                fingerHint: 'All fingers spread apart.'
            },
            {
                step: 2,
                title: 'Touch Thumb to Forehead',
                instruction: 'Touch the tip of your thumb against the center of your forehead.',
                fingerHint: 'Thumb tip rests on brow.'
            },
            {
                step: 3,
                title: 'Tap Twice',
                instruction: 'Tap your thumb lightly against your forehead twice.',
                fingerHint: 'Open 5-hand tapping forehead = Father.'
            }
        ]
    },

    // 14. Friend
    'friend': {
        sign_name: 'Friend',
        category: 'Common Phrases',
        meaning: 'A companion or trusted person.',
        summary: 'Hooked index fingers link together like chain links.',
        steps: [
            {
                step: 1,
                title: 'Hook Both Index Fingers',
                instruction: 'Curl both your index fingers into hooks, curling all other fingers in.',
                fingerHint: 'Two hooked index fingers.'
            },
            {
                step: 2,
                title: 'Link Fingers Together',
                instruction: 'Hook your right index finger over your left index finger.',
                fingerHint: 'Interlock like two chain links.'
            },
            {
                step: 3,
                title: 'Reverse and Link',
                instruction: 'Unhook and reverse so left hooks over right.',
                fingerHint: 'Linked hooked fingers = Friend.'
            }
        ]
    },

    // 15. School
    'school': {
        sign_name: 'School',
        category: 'Common Phrases',
        meaning: 'Educational institution.',
        summary: 'Two flat hands clap together horizontally twice.',
        steps: [
            {
                step: 1,
                title: 'Flat Hands Ready',
                instruction: 'Hold both hands completely flat with fingers together.',
                fingerHint: 'Both hands flat and open.'
            },
            {
                step: 2,
                title: 'Position Horizontally',
                instruction: 'Place one palm facing up and the other palm facing down above it.',
                fingerHint: 'Hands horizontal in front of chest.'
            },
            {
                step: 3,
                title: 'Clap Twice',
                instruction: 'Clap your top palm down against the bottom palm twice.',
                fingerHint: 'Horizontal flat hand clap = School.'
            }
        ]
    },

    // 16. Letter A
    'letter a': {
        sign_name: 'Letter A',
        category: 'Alphabet',
        meaning: 'Fingerspelling letter A.',
        summary: 'Closed fist with thumb standing upright on the side.',
        steps: [
            {
                step: 1,
                title: 'Curl 4 Fingers',
                instruction: 'Curl all 4 fingers tightly into your palm.',
                fingerHint: 'Index, middle, ring, pinky curled in.'
            },
            {
                step: 2,
                title: 'Thumb Upright on Side',
                instruction: 'Rest your thumb straight upright against the side of your index finger.',
                fingerHint: 'Thumb stays on the outside side, pointing up.'
            },
            {
                step: 3,
                title: 'Show to Camera',
                instruction: 'Hold your fist steady facing forward into the camera.',
                fingerHint: 'Fist with thumb on side = Letter A.'
            }
        ]
    },

    // 17. Letter B
    'letter b': {
        sign_name: 'Letter B',
        category: 'Alphabet',
        meaning: 'Fingerspelling letter B.',
        summary: 'Four fingers upright together with thumb tucked across palm.',
        steps: [
            {
                step: 1,
                title: '4 Fingers Upright',
                instruction: 'Hold all 4 fingers straight up and pressed together.',
                fingerHint: 'Keep fingers tightly touching.'
            },
            {
                step: 2,
                title: 'Tuck Thumb In',
                instruction: 'Fold your thumb flat across the front of your palm.',
                fingerHint: 'Thumb resting horizontally on palm.'
            },
            {
                step: 3,
                title: 'Palm Facing Camera',
                instruction: 'Hold your hand upright with palm facing the camera.',
                fingerHint: '4 upright fingers + tucked thumb = Letter B.'
            }
        ]
    },

    // 18. Letter C
    'letter c': {
        sign_name: 'Letter C',
        category: 'Alphabet',
        meaning: 'Fingerspelling letter C.',
        summary: 'Curved hand forming the silhouette of the letter C.',
        steps: [
            {
                step: 1,
                title: 'Curve Your Fingers',
                instruction: 'Curve your 4 fingers together into a smooth downward arch.',
                fingerHint: 'Fingers arched together.'
            },
            {
                step: 2,
                title: 'Curve Your Thumb',
                instruction: 'Curve your thumb underneath to mirror your fingers.',
                fingerHint: 'Leave a clear opening between fingers and thumb.'
            },
            {
                step: 3,
                title: 'Form "C" Silhouette',
                instruction: 'Turn your hand slightly to show the clear "C" curve to the camera.',
                fingerHint: 'Curved arch = Letter C.'
            }
        ]
    },

    // 19. Number 1
    'number 1': {
        sign_name: 'Number 1',
        category: 'Numbers',
        meaning: 'The number one in ASL.',
        summary: 'Index finger pointing straight up, other fingers curled in.',
        steps: [
            {
                step: 1,
                title: 'Point Index Up',
                instruction: 'Extend only your index finger straight up to the ceiling.',
                fingerHint: 'Index finger straight.'
            },
            {
                step: 2,
                title: 'Tuck Other Fingers',
                instruction: 'Curl your middle, ring, and pinky fingers into your palm.',
                fingerHint: 'Thumb holds down curled fingers.'
            },
            {
                step: 3,
                title: 'Hold Upright',
                instruction: 'Hold your index finger steady facing the camera.',
                fingerHint: 'Only index pointing up = Number 1.'
            }
        ]
    },

    // 20. Number 2
    'number 2': {
        sign_name: 'Number 2',
        category: 'Numbers',
        meaning: 'The number two in ASL.',
        summary: 'Index and middle fingers extended up in a V shape (peace sign).',
        steps: [
            {
                step: 1,
                title: 'Make a "V" Shape',
                instruction: 'Extend your index and middle fingers straight up spread in a V.',
                fingerHint: 'Peace sign shape.'
            },
            {
                step: 2,
                title: 'Tuck Ring and Pinky',
                instruction: 'Fold your ring and pinky fingers into your palm with your thumb holding them.',
                fingerHint: 'Ring and pinky held down.'
            },
            {
                step: 3,
                title: 'Face Camera',
                instruction: 'Hold your V-shape steady with palm facing forward.',
                fingerHint: 'V-sign = Number 2.'
            }
        ]
    },

    // 21. Number 3
    'number 3': {
        sign_name: 'Number 3',
        category: 'Numbers',
        meaning: 'The number three in ASL.',
        summary: 'Thumb, index, and middle fingers extended upright.',
        steps: [
            {
                step: 1,
                title: 'Extend 3 Fingers',
                instruction: 'In ASL 3, extend your thumb, index finger, and middle finger.',
                fingerHint: 'Note: Thumb, index, and middle (NOT pinky).'
            },
            {
                step: 2,
                title: 'Fold Ring & Pinky',
                instruction: 'Fold your ring and pinky fingers flat against your palm.',
                fingerHint: 'Ring and pinky curled tightly in.'
            },
            {
                step: 3,
                title: 'Face Camera',
                instruction: 'Hold with thumb pointing out and index/middle pointing straight up.',
                fingerHint: 'Thumb + Index + Middle = Number 3.'
            }
        ]
    }
};

/**
 * Helper to retrieve step-by-step instructions by sign name.
 */
export function getSignSteps(signName) {
    if (!signName) return null;
    const key = signName.toLowerCase().trim();
    if (SIGN_STEPS[key]) return SIGN_STEPS[key];
    
    // Partial match search
    const found = Object.keys(SIGN_STEPS).find(k => k.includes(key) || key.includes(k));
    return found ? SIGN_STEPS[found] : null;
}
