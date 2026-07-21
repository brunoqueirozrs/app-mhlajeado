const { GoogleGenAI } = require("@google/genai");

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
      config: {
        systemInstruction: "You are a bot"
      }
    });
    console.log("Success:", response.text);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
