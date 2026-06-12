export interface AiResponse {
  provider: string;
  response: string;
  success: boolean;
}

export async function queryAiProvider(
  provider: string,
  prompt: string,
  apiKey?: string
): Promise<AiResponse> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return { provider, response: 'Please type a valid prompt.', success: false };
  }

  // 1. If provider is Gemini and we have an API Key, run a real API call!
  if (provider === 'gemini' && apiKey && apiKey.trim()) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: cleanPrompt }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) {
        return { provider: 'Gemini (1.5 Flash)', response: aiText.trim(), success: true };
      }
      throw new Error('Invalid response structure from Gemini API');
    } catch (err: any) {
      console.warn('[Gemini API Error] Falling back:', err);
      return {
        provider: 'Gemini (1.5 Flash) [Error]',
        response: `API Request failed: ${err.message}. Please verify your API key and connection.`,
        success: false,
      };
    }
  }

  // 2. Simulated Developer-themed fallbacks for each provider
  return new Promise((resolve) => {
    setTimeout(() => {
      let response = '';
      let providerName = '';

      switch (provider) {
        case 'gemini':
          providerName = 'Gemini (Local Flash)';
          response = apiKey
            ? 'Key configured but local cache is busy. Retrying...'
            : 'Gemini local simulation: "Hello developer! Setup your Gemini API Key in Studio Settings to activate the real SDK connection."';
          break;
        case 'gpt':
          providerName = 'GPT-4 (Simulation)';
          if (cleanPrompt.toLowerCase().includes('weather')) {
            response = 'GPT-4 Weather analysis: Open-Meteo current forecast points to 18°C Rain. Advise keeping an umbrella handy.';
          } else if (cleanPrompt.toLowerCase().includes('todo') || cleanPrompt.toLowerCase().includes('task')) {
            response = 'GPT-4 Task checklist: You have 3 remaining tasks today. Main priority: "Ship the Expo build".';
          } else if (cleanPrompt.toLowerCase().includes('git') || cleanPrompt.toLowerCase().includes('commit')) {
            response = 'GPT-4 Git details: Active branch is "main", last commit has been synchronized natively.';
          } else {
            response = `GPT-4 Response: Processed request "${cleanPrompt}". System parameters and widgets are operating nominally.`;
          }
          break;
        case 'claude':
          providerName = 'Claude 3.5 (Simulation)';
          response = `Claude 3.5: Analysed query "${cleanPrompt}". The Nothing OS dot-matrix layouts and Liquid Glass theme show 100% design alignment.`;
          break;
        case 'deepseek':
          providerName = 'DeepSeek-V3 (Simulation)';
          response = `DeepSeek-V3: Optimizing logical pipeline for "${cleanPrompt}". Background battery drain calculated at 0.18% / hour.`;
          break;
        default:
          providerName = 'AI Assistant';
          response = `Processed: "${cleanPrompt}" successfully.`;
      }

      resolve({ provider: providerName, response, success: true });
    }, 1000);
  });
}
