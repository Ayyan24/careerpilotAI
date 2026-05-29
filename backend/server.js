const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables from the .env file
const envResult = dotenv.config({ path: path.join(__dirname, ".env") });
if (envResult.error) {
  console.warn("⚠️ Could not load backend/.env file:", envResult.error.message || envResult.error);
}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const rawGeminiKey = process.env.GEMINI_API_KEY || "";
const GEMINI_API_KEY = rawGeminiKey.trim().replace(/^"(.*)"$/, "$1");
const hasGeminiKey = Boolean(GEMINI_API_KEY) && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE";

if (!hasGeminiKey) {
  console.warn(
    "⚠️ GEMINI_API_KEY is not configured or is still a placeholder. The backend will start, but /chat requests will return a readable error message.\n" +
    "Please add a valid key to backend/.env in the form: GEMINI_API_KEY=your_api_key_here"
  );
}

const app = express();
app.use(cors()); // allow all origins, including file:// and local hosted frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const geminiClient = hasGeminiKey ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const modelCandidates = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "chat-bison-001",
  "text-bison-001",
];
const systemInstruction =
  "You are CareerPilot AI, a helpful career guidance assistant for students. " +
  "Provide career suggestions, skills needed, and a beginner roadmap in short clean responses.";

function createCareerModel(modelName) {
  return geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });
}

function isModelNotFoundError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("is not found") || message.includes("not found");
}

function isUnauthorizedError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("unauthorized") || message.includes("401");
}

function isGenerateContentUnsupported(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("not supported for generatecontent") || message.includes("not supported for generatecontent");
}

async function executeModelRequest(careerModel, prompt) {
  try {
    const result = await careerModel.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error("Gemini returned an unexpected response shape.");
    }
    return result.response.text();
  } catch (error) {
    if (isGenerateContentUnsupported(error) && typeof careerModel.sendMessage === "function") {
      console.warn("⚠️ generateContent unsupported; trying sendMessage fallback.");
      const fallbackResult = await careerModel.sendMessage(prompt);
      if (!fallbackResult || !fallbackResult.response) {
        throw new Error("Gemini sendMessage returned an unexpected response shape.");
      }
      return fallbackResult.response.text();
    }
    throw error;
  }
}

async function generateCareerAdvice(message) {
  if (!geminiClient) {
    console.warn("⚠️ GEMINI_API_KEY is missing. Returning local fallback response.");
    return `CareerPilot Demo Mode:\n\nI can help you with career guidance even without a live AI key. For a real Gemini response, add a valid GEMINI_API_KEY to backend/.env and restart the server.\n\nQuestion: ${message}\n\nAdvice: Start by defining your interests, choose a field that fits your skills, learn the key tools and concepts, build small projects, and network with professionals in that area.`;
  }

  const prompt = `Student asks: ${message}`;
  let lastError = null;

  for (const modelName of modelCandidates) {
    try {
      console.log(`📨 Trying model ${modelName} for message:`, message);
      const careerModel = createCareerModel(modelName);
      const responseText = await executeModelRequest(careerModel, prompt);

      if (responseText && responseText.trim().length > 0) {
        console.log(`✅ Model ${modelName} succeeded`);
        console.log("💬 AI Response:", responseText);
        return responseText;
      }

      console.warn(`⚠️ Model ${modelName} returned an empty response.`);
      lastError = new Error("Empty response received from Gemini.");
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Model ${modelName} failed:`, error?.message || error);
      if (isUnauthorizedError(error)) {
        throw new Error(
          "Authentication failed for the Gemini API key. Check GEMINI_API_KEY in backend/.env."
        );
      }
      if (!isModelNotFoundError(error)) {
        console.warn("ℹ️ Continuing to next model candidate after non-model error.");
      }
    }
  }

  throw new Error(
    `Unable to generate AI response. Last error: ${lastError?.message || "Unknown"}`
  );
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerPilot AI backend is running.",
  });
});

app.get("/models", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(400).json({
      success: false,
      error: "GEMINI_API_KEY is not configured.",
    });
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
      },
    });

    const payload = await response.json();
    return res.json({
      success: true,
      status: response.status,
      models: payload,
    });
  } catch (error) {
    console.error("❌ Error fetching model list:", error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Could not fetch model list.",
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // FIXED: Added comprehensive input validation with detailed logging
    if (!message) {
      console.warn("⚠️ Empty request body received");
      return res.status(400).json({
        success: false,
        error: "Message is required and cannot be empty",
      });
    }
    
    if (typeof message !== "string") {
      console.warn("⚠️ Invalid message type:", typeof message);
      return res.status(400).json({
        success: false,
        error: "Message must be a text string",
      });
    }
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      console.warn("⚠️ Message contains only whitespace");
      return res.status(400).json({
        success: false,
        error: "Message cannot be only whitespace",
      });
    }

    console.log("🎯 /chat endpoint received message:", trimmedMessage);

    // Call Gemini AI to generate career advice
    const reply = await generateCareerAdvice(trimmedMessage);

    if (!reply || reply.trim().length === 0) {
      console.warn("⚠️ Gemini returned empty response for:", trimmedMessage);
      return res.status(500).json({
        success: false,
        error: "AI returned an empty response. Please try again.",
      });
    }

    console.log("✅ Sending successful response to frontend");
    
    // FIXED: Consistent response format (using 'reply' field to match frontend parsing)
    return res.json({
      success: true,
      reply: reply, // Changed from 'response' to 'reply' for clarity
      response: reply, // Keep both for backwards compatibility
    });
  } catch (error) {
    console.error("❌ Error in /chat endpoint:", error.message);
    console.error("Full error:", error);
    
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong with the AI. Please try again.",
    });
  }
});

// FIXED: Enhanced error handler middleware with detailed logging
app.use((error, req, res, next) => {
  console.error("❌ Unhandled Server Error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON payload",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Internal server error" : error.message || "Request failed",
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 CareerPilot AI Backend Server Started Successfully!");
  console.log("=".repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📨 Chat endpoint ready at http://localhost:${PORT}/chat`);
  console.log(`🏥 Health check: http://localhost:${PORT}/`);
  console.log("\n📋 Environment Setup:");
  console.log(`   • PORT: ${PORT}`);
  console.log(`   • API Key: ${hasGeminiKey ? "✅ Configured" : "❌ NOT SET or placeholder"}`);
  console.log(`   • CORS: Enabled for all origins`);
  console.log(`   • JSON Parsing: Enabled`);
  console.log("\n💡 Quick Start:");
  console.log("   1. Frontend should make POST requests to /chat with { message: 'text' }");
  console.log("   2. Backend will return { success: true, reply: 'response', response: 'response' }");
  console.log("   3. Check console below for request/response logs");
  console.log("\n🔍 Debugging:");
  console.log("   • Open browser DevTools (F12) to see frontend logs");
  console.log("   • Check this console for backend logs");
  console.log("   • Both should show emoji-prefixed debug messages");
  console.log("=".repeat(60) + "\n");
});

server.on("error", (error) => {
  console.error("❌ Backend failed to start:", error.message || error);
  process.exit(1);
});
