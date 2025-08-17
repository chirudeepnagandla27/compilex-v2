const express = require("express");
const cors = require("cors");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { executeJava } = require("./executeJava"); // Import the Java executor
const { generateInputFile } = require("./generateInputFile");

// Load environment variables (optional)
try {
  require('dotenv').config();
} catch (_) {}

const app = express();

// Middleware to enable CORS and parse request bodies
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Root route for testing server status
app.get("/", (req, res) => {
    console.log("🌐 GET / hit");
    res.send("🟢 Backend is running!");
});

// ✅ Main /run route to compile and execute code
app.post("/run", async (req, res) => {
    console.log("📩 POST /run endpoint triggered");

    const { language = 'cpp', code, input } = req.body;
    console.log(`📦 Received request for language: ${language}, code length: ${code ? code.length : 0}`);

    if (!code) {
        console.log("❌ Error: Code is undefined or empty.");
        return res.status(400).json({ success: false, error: "Empty code body" });
    }

    try {
        console.log("📝 Generating file...");
        const filePath = await generateFile(language, code);
        const inputFilePath = await generateInputFile(input || "");
        console.log("📁 File generated at:", filePath);

        let output;

        if (language === "cpp") {
            console.log("🚀 Executing C++ code...");
            output = await executeCpp(filePath,inputFilePath);
        } else if (language === "c") {
            console.log("🚀 Executing C code (using g++ for compatibility)...");
            output = await executeCpp(filePath,inputFilePath);
        } else if (language === "py") {
            console.log("🚀 Executing Python code...");
            output = await executePy(filePath,inputFilePath);
        } else if (language === "java") {
            console.log("🚀 Executing Java code...");
            output = await executeJava(filePath,inputFilePath);
        } else {
            console.log(`❌ Error: Unsupported language: ${language}`);
            return res.status(400).json({ success: false, error: "Unsupported language" });
        }

        console.log("✅ Execution successful. Output:", output);
        return res.json({ success: true, output });

    } catch (error) {
        console.error("💥 Error during execution (full error object):", error); // Log the full error object for debugging

        let errorMessage = "An unknown error occurred.";

        // Attempt to extract a more specific error message
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error instanceof Error) { // Check if it's a standard Error object
            errorMessage = error.message;
        } else if (error && typeof error === 'object') {
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else if (error.stderr) { // From child_process, this is often the compile/runtime error
                errorMessage = error.stderr;
            } else if (error.stdout) { // Sometimes errors might be in stdout if the program prints them before exiting non-zero
                errorMessage = error.stdout;
            } else {
                // Fallback to stringifying if no specific known properties are found
                try {
                    errorMessage = JSON.stringify(error, null, 2); // Pretty print JSON for better readability
                } catch (e) {
                    errorMessage = "Error object could not be stringified.";
                }
            }
        }
        console.error("📢 Sending error to frontend:", errorMessage);
        return res.status(500).json({ success: false, error: errorMessage });
    }
});

// ✅ AI Review route (optional Gemini integration)
app.post('/ai-review', async (req, res) => {
  const { code } = req.body || {};
  if (!code) {
    return res.status(400).json({ success: false, error: 'Empty code body' });
  }

  // Resolve a fetch implementation (global or node-fetch)
  const resolveFetch = async () => {
    if (typeof fetch !== 'undefined') return fetch;
    try {
      const mod = await import('node-fetch');
      return mod.default || mod;
    } catch (e) {
      return null;
    }
  };

  // Fallback simple heuristic review
  const localHeuristicReview = (src) => {
    const tips = [];
    if (src.length > 5000) tips.push('- The file is large; consider breaking logic into smaller functions.');
    if (/scanf\s*\(/.test(src) || /gets\s*\(/.test(src)) tips.push('- Avoid unsafe input functions; prefer fgets/scanf with width or safer alternatives.');
    if (/using\s+namespace\s+std\s*;/.test(src)) tips.push('- In C++, avoid `using namespace std;` in headers; prefer explicit `std::` prefixes.');
    if (/System\.out\.print(ln)?\(/.test(src) && /Scanner\s*\(/.test(src)) tips.push('- In Java, close `Scanner` or reuse it to avoid resource leaks.');
    if (/input\s*\(/.test(src) && /print\s*\(/.test(src)) tips.push('- In Python, prefer `if __name__ == "__main__":` guard for script entry.');
    if (tips.length === 0) tips.push('- Looks good overall. Add comments and tests for edge cases.');
    return tips.join('\n');
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: true, review: localHeuristicReview(code) });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a senior code reviewer. Provide a concise markdown code review with:\n- correctness issues\n- complexity and performance notes\n- edge cases and tests to add\n- security pitfalls\n\nReview this code:\n\n\n${code}`
            }
          ]
        }
      ]
    };

    const doFetch = await resolveFetch();
    if (!doFetch) {
      console.warn('No fetch implementation available; returning heuristic review.');
      return res.json({ success: true, review: localHeuristicReview(code) });
    }

    const resp = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Gemini API error:', text);
      return res.json({ success: true, review: localHeuristicReview(code) });
    }

    const data = await resp.json();
    let reviewText = '';
    try {
      // Gemini returns candidates -> content -> parts -> text
      reviewText = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
    } catch (_) {
      reviewText = '';
    }

    if (!reviewText) reviewText = localHeuristicReview(code);

    return res.json({ success: true, review: reviewText });
  } catch (err) {
    console.error('AI Review error:', err);
    return res.json({ success: true, review: localHeuristicReview(code) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, (error) => {
    if (error) {
        console.log(`❌ Error while running the server on port ${PORT}:`, error);
    } else {
        console.log(`✅ Server started on http://localhost:${PORT}`);
    }
});
