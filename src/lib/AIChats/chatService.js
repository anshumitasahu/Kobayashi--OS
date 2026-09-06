/**
 * Sends the conversation to OpenRouter and parses the JSON response.
 * Throws on transport errors; tags unparseable responses with
 * code "INVALID_JSON_RESPONSE" so the caller can reply gracefully.
 */
export async function sendChatCompletion(messages) {
    let response;
    try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "Kobayashi OS",
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages,
                temperature: 0.1,
                response_format: {
                    type: "json_object",
                },
            }),
        });
    } catch (networkError) {
        const error = new Error("Could not reach the AI service.");
        error.code = "NETWORK_ERROR";
        error.cause = networkError;
        throw error;
    }

    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`OpenRouter API error ${response.status}: ${errorText}`);
        error.code = "API_ERROR";
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
        const error = new Error("OpenRouter returned an empty response.");
        error.code = "EMPTY_RESPONSE";
        throw error;
    }

    try {
        return JSON.parse(text);
    } catch {
        const error = new Error("OpenRouter returned a response I could not parse.");
        error.code = "INVALID_JSON_RESPONSE";
        throw error;
    }
}
