const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const buildPrompt = (userMessage) => `You are S'Techdy AI, a helpful study assistant. The user asked: "${userMessage}".

If they want to create a study schedule, respond with: "Of course! Please press on create Schedule to continue!!!"

Otherwise, provide a helpful, friendly response related to studying, productivity, or scheduling.`;

const callGemini = async (modelName, prompt) => {
  const response = await fetch(
    `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `Gemini request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI service is not configured" });
    }

    const prompt = buildPrompt(message.trim());
    // Prefer currently supported text models for newer projects/keys.
    const modelCandidates = [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-1.5-flash",
    ];

    let lastError = null;
    for (const modelName of modelCandidates) {
      try {
        const reply = await callGemini(modelName, prompt);
        return res.status(200).json({
          message: "AI response generated successfully",
          data: { reply, model: modelName },
        });
      } catch (error) {
        lastError = error;
      }
    }

    const statusCode = lastError?.status && Number.isInteger(lastError.status)
      ? lastError.status
      : 500;

    return res.status(statusCode).json({
      message: "Failed to generate AI response",
      error: lastError?.message || "Unknown AI error",
    });
  } catch (error) {
    console.error("AI chat controller error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
