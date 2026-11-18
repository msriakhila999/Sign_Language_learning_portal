const db = require('../config/db');

// Supported Sign Vocabulary Reference for AI Grounding
const SUPPORTED_SIGNS_SUMMARY = `
SignBridge supports 21 American Sign Language (ASL) gestures across 5 categories:
1. Greetings:
   - Hello: Open flat 5-hand salute moving outward near temple.
   - Thank You: Flat open hand touching fingertips to chin/lips then extending outward toward person.
   - Please: Flat open palm placed over chest rubbing in a gentle clockwise circle.
   - Sorry: Closed fist (S or A handshape) placed over chest rubbing in gentle circles.
2. Common Words:
   - Yes: Closed fist (S handshape) held in front nodding up and down like a head nod.
   - No: Index and Middle fingertips pinching against Thumb tip while reaching forward; Ring and Pinky curled.
   - Good: Flat open hand at chin moving down into opposite flat palm.
   - Bad: Flat open hand starting at chin, flipped sharply downward with palm facing the floor.
   - Water: 'W' handshape (Index, Middle, Ring extended upright; Pinky curled into palm; Thumb folded over pinky).
   - Food: All 5 fingertips (Thumb, Index, Middle, Ring, Pinky) bunched together (flattened 'O') tapping against mouth.
3. Common Phrases:
   - Help: Fist with thumb pointing straight UP (Thumbs-Up) resting on or lifted from opposite flat palm.
   - Mother: Open 5-hand with thumb tip touching the chin.
   - Father: Open 5-hand with thumb tip touching the forehead.
   - Friend: Hooked index finger interlocked with opposite index finger, others curled.
   - School: Flat open hands clapping together horizontally twice.
4. Alphabet:
   - Letter A: Tight fist with 4 fingers curled into palm; thumb extended straight UP alongside index knuckle.
   - Letter B: 4 fingers (Index, Middle, Ring, Pinky) extended straight UP together; thumb folded flat across palm.
   - Letter C: Thumb and all 4 fingers curved into an open C-shaped arc.
5. Numbers:
   - Number 1: Index finger extended straight UP; Middle, Ring, Pinky curled into palm; Thumb folded.
   - Number 2: Index and Middle fingers extended upright in a V-shape; Ring and Pinky curled.
   - Number 3: Thumb, Index, and Middle fingers extended outward/upright; Ring and Pinky curled into palm.
`;

/**
 * Robust Google Gemini Client with automatic model fallback
 */
async function callGemini(apiKey, systemPrompt, userMessage) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 600
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return { success: true, reply: text, model, provider: 'Google Gemini' };
                }
            }

            const errJson = await response.json().catch(() => null);
            const errMsg = errJson?.error?.message || response.statusText || `HTTP ${response.status}`;
            lastError = { status: response.status, message: errMsg, model };

            // If 404 (model not found for this API key/region), attempt next supported model
            if (response.status === 404) {
                console.warn(`Model ${model} not available (404), trying next model...`);
                continue;
            }

            // For other errors (e.g. 400 Invalid Key, 403 Quota), stop and report
            break;
        } catch (fetchErr) {
            lastError = { status: 500, message: fetchErr.message, model };
            break;
        }
    }

    return { success: false, ...lastError };
}

/**
 * Robust OpenAI Client (if configured)
 */
async function callOpenAI(apiKey, systemPrompt, userMessage) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        if (response.ok) {
            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
                return { success: true, reply: text, model: 'gpt-4o-mini', provider: 'OpenAI' };
            }
        }

        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || `OpenAI returned status ${response.status}`;
        return { success: false, status: response.status, message: errMsg, model: 'gpt-4o-mini' };
    } catch (err) {
        return { success: false, status: 500, message: err.message, model: 'gpt-4o-mini' };
    }
}

/**
 * GET /api/ai/status
 * Reports whether live AI provider credentials (Gemini / OpenAI) are configured.
 */
async function getStatus(req, res) {
    res.setHeader('Content-Type', 'application/json');
    const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
    const openAiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
    
    const hasGemini = Boolean(geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE');
    const hasOpenAI = Boolean(openAiKey && openAiKey !== 'YOUR_OPENAI_API_KEY_HERE');

    return res.json({
        success: true,
        configured: hasGemini || hasOpenAI,
        provider: hasGemini ? 'Google Gemini' : (hasOpenAI ? 'OpenAI' : 'None'),
        model: hasGemini ? 'gemini-2.5-flash' : (hasOpenAI ? 'gpt-4o-mini' : null)
    });
}

/**
 * POST /api/ai/chat
 * Streams user questions directly to Google Gemini or OpenAI with strict sign grounding.
 */
async function chat(req, res) {
    res.setHeader('Content-Type', 'application/json');

    try {
        const { message, context } = req.body;
        const userId = req.user ? req.user.userId : 1;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'VALIDATION_ERROR',
                message: 'Message text is required.' 
            });
        }

        const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
        const openAiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
        const isGeminiConfigured = Boolean(geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE');
        const isOpenAiConfigured = Boolean(openAiKey && openAiKey !== 'YOUR_OPENAI_API_KEY_HERE');

        // STRICT REQUIREMENT: If API key is missing, return a meaningful configuration error
        if (!isGeminiConfigured && !isOpenAiConfigured) {
            return res.status(400).json({
                success: false,
                error: 'API_KEY_REQUIRED',
                message: 'No AI API Key is configured. To receive live AI responses, add GEMINI_API_KEY in backend/.env.',
                fix: '1. Open backend/.env\n2. Set GEMINI_API_KEY=your_gemini_api_key\n3. Restart the backend server (npm run dev)'
            });
        }

        // Fetch user progress for context grounding
        let userStats = { completed_count: 0, avg_accuracy: 90 };
        try {
            const [progressRows] = await db.query(
                `SELECT COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count,
                        AVG(accuracy) as avg_accuracy
                 FROM user_progress 
                 WHERE user_id = ?`,
                [userId]
            );
            if (progressRows && progressRows.length > 0) {
                userStats = progressRows[0];
            }
        } catch (dbErr) {
            console.warn('AI context DB lookup warning:', dbErr.message);
        }

        const systemPrompt = `You are SignBot, an expert AI Sign Language Tutor integrated into SignBridge - a web portal for learning American Sign Language (ASL) supporting UN SDG 10 (Reduced Inequalities).
${SUPPORTED_SIGNS_SUMMARY}
User Learning Stats:
- Completed Signs: ${userStats.completed_count || 0} of 21
- Average Accuracy: ${Math.round(userStats.avg_accuracy || 90)}%
Current Active Sign Context: ${context?.activeSign || 'None'}
Current Page: ${context?.currentPage || 'General'}

Instructions:
1. Provide accurate, step-by-step physical finger posture and hand placement guidance for supported signs.
2. Break explanations down by: Handshape, Fingers, Thumb, and Common Pitfalls.
3. Be encouraging, concise, and format answers using clear headers and bullet points.
4. Only recommend signs that are supported in the SignBridge portal. Do NOT invent unsupported signs.`;

        // 1. Google Gemini Provider
        if (isGeminiConfigured) {
            const result = await callGemini(geminiKey, systemPrompt, message.trim());
            
            if (result.success) {
                return res.json({
                    success: true,
                    reply: result.reply,
                    provider: result.provider,
                    model: result.model,
                    timestamp: new Date()
                });
            }

            console.error('Gemini API call failed:', result.message);
            return res.status(result.status >= 400 && result.status < 500 ? 400 : 502).json({
                success: false,
                error: 'GEMINI_API_ERROR',
                message: `Google Gemini API Error: ${result.message}`,
                fix: 'Please verify that your GEMINI_API_KEY is active and valid in backend/.env.'
            });
        }

        // 2. OpenAI Provider (Fallback if OPENAI_API_KEY is configured instead)
        if (isOpenAiConfigured) {
            const result = await callOpenAI(openAiKey, systemPrompt, message.trim());

            if (result.success) {
                return res.json({
                    success: true,
                    reply: result.reply,
                    provider: result.provider,
                    model: result.model,
                    timestamp: new Date()
                });
            }

            console.error('OpenAI API call failed:', result.message);
            return res.status(result.status >= 400 && result.status < 500 ? 400 : 502).json({
                success: false,
                error: 'OPENAI_API_ERROR',
                message: `OpenAI API Error: ${result.message}`,
                fix: 'Please verify that your OPENAI_API_KEY is active and valid in backend/.env.'
            });
        }

    } catch (error) {
        console.error('AI chat endpoint error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'AI_SERVER_ERROR',
            message: `Internal server error while processing AI chat: ${error.message}` 
        });
    }
}

module.exports = {
    chat,
    getStatus
};
