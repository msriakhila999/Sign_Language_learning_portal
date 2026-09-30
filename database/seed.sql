-- SignBridge Database Seed Data

USE signbridge_db;

-- 1. Insert Categories
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Greetings', 'Essential signs used for daily greetings and basic polite interactions.'),
(2, 'Common Words', 'Frequently used everyday vocabulary for basic communication.'),
(3, 'Common Phrases', 'Important phrases used in everyday conversation and urgent assistance.'),
(4, 'Alphabet', 'American Sign Language (ASL) fingerspelling letters from A to Z.'),
(5, 'Numbers', 'Numerical hand signs for counting, age, time, and quantities.')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 2. Insert Signs
INSERT INTO signs (sign_id, category_id, sign_name, meaning, description, instructions, image_url, video_url) VALUES
-- Greetings
(1, 1, 'Hello', 'A standard polite greeting used when meeting someone.', 'Used to greet people politely at any time of day.', 'Raise open palm near your temple and move hand slightly outward in a gentle salute gesture.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60', ''),
(2, 1, 'Thank You', 'An expression of gratitude and appreciation.', 'Used to show gratitude when receiving help or a kindness.', 'Touch your fingertips to your chin/lips with an open hand, then extend hand outward towards the person.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60', ''),
(3, 1, 'Please', 'A polite request word.', 'Used when making a courteous request.', 'Place flat open hand over your chest/heart and rub in a soft circular motion.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60', ''),
(4, 1, 'Sorry', 'An expression of apology or regret.', 'Used to apologize or express sympathy.', 'Form a loose fist (or S handshape) over your chest and rub in small circular motion.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60', ''),

-- Common Words
(5, 2, 'Yes', 'An affirmative response or agreement.', 'Used to agree or say affirmative.', 'Form a fist (S handshape) and nod it up and down like a head nodding.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60', ''),
(6, 2, 'No', 'A negative response or disagreement.', 'Used to decline or state a negative.', 'Bring index finger, middle finger, and thumb together rapidly in a snapping motion.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=60', ''),
(7, 2, 'Good', 'Positive quality or approval.', 'Describes something pleasant, satisfactory, or high quality.', 'Touch fingertips of flat hand to chin, then bring hand down into palm of opposite open hand.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60', ''),
(8, 2, 'Bad', 'Unfavorable quality or disapproval.', 'Describes something unsatisfactory or wrong.', 'Touch chin with flat hand, then flip hand palm-down downward sharply.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60', ''),
(9, 2, 'Water', 'Clear liquid essential for life.', 'Used to ask for or refer to drinking water.', 'Form a W handshape (index, middle, ring finger up) and tap index finger against chin twice.', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60', ''),
(10, 2, 'Food', 'Nutrient intake or eating.', 'Refers to food, eating, or meals.', 'Flatten fingers against thumb (O handshape) and tap against your mouth twice.', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60', ''),

-- Common Phrases
(11, 3, 'Help', 'Requesting or offering assistance.', 'Used to ask for help or offer support to someone in need.', 'Place fist with thumb pointing up on flat palm of opposite hand and lift both hands upward together.', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&auto=format&fit=crop&q=60', ''),
(12, 3, 'Mother', 'Female parent.', 'Used to refer to mother or mom.', 'Touch thumb of open five-hand against your chin.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60', ''),
(13, 3, 'Father', 'Male parent.', 'Used to refer to father or dad.', 'Touch thumb of open five-hand against your forehead.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60', ''),
(14, 3, 'Friend', 'A companion or trusted person.', 'Refers to a close acquaintance or friend.', 'Interlock index fingers of both hands first one way, then reverse.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=60', ''),
(15, 3, 'School', 'Educational institution.', 'Refers to school, studying, or learning environment.', 'Clap flat hands together horizontally twice.', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&auto=format&fit=crop&q=60', ''),

-- Alphabet
(16, 4, 'Letter A', 'Fingerspelling letter A.', 'The first letter of the ASL alphabet.', 'Form a fist with thumb resting alongside the index finger pointing upright.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60', ''),
(17, 4, 'Letter B', 'Fingerspelling letter B.', 'The second letter of the ASL alphabet.', 'Extend four fingers upright together, fold thumb across palm.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60', ''),
(18, 4, 'Letter C', 'Fingerspelling letter C.', 'The third letter of the ASL alphabet.', 'Curved hand forming a C shape with thumb and fingers.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60', ''),

-- Numbers
(19, 5, 'Number 1', 'Fingerspelling number 1.', 'The number one in ASL.', 'Extend index finger up while holding other fingers in with thumb.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60', ''),
(20, 5, 'Number 2', 'Fingerspelling number 2.', 'The number two in ASL.', 'Extend index and middle finger up in V shape.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60', ''),
(21, 5, 'Number 3', 'Fingerspelling number 3.', 'The number three in ASL.', 'Extend thumb, index, and middle finger.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60', '')
ON DUPLICATE KEY UPDATE sign_name=VALUES(sign_name), meaning=VALUES(meaning);
