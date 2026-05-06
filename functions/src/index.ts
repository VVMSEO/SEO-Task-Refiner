import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { SYSTEM_PROMPTS } from './prompts';

const ROUTERAI_KEY = defineSecret('ROUTERAI_KEY');
const ALLOWED_EMAILS = ['wzrdseo@gmail.com', 'ВАШ_EMAIL@gmail.com']; // Updated with the user from metadata

export const refineTask = onCall(
  { secrets: [ROUTERAI_KEY], region: 'europe-west1', cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Auth required');
    const email = request.auth.token.email;
    if (!email || !ALLOWED_EMAILS.includes(email)) {
      throw new HttpsError('permission-denied', 'Email not in allowlist');
    }

    const { mode, input } = request.data as { mode: string; input: string };
    if (!input || input.length > 5000) {
      throw new HttpsError('invalid-argument', 'Input invalid');
    }

    const systemPrompt = SYSTEM_PROMPTS[mode]; // см. блок выше
    if (!systemPrompt) throw new HttpsError('invalid-argument', 'Unknown mode');

    const res = await fetch('https://routerai.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ROUTERAI_KEY.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.6',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new HttpsError('internal', `RouterAI: ${res.status} ${text}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }
);
