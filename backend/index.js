const express = require("express");
const cors = require("cors");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { executeJava } = require("./executeJava"); // Import the Java executor
const { generateInputFile } = require("./generateInputFile");

const app = express();

// Middleware to enable CORS and parse request bodies
app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from your frontend
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
        const inputFilePath = await generateInputFile(input);
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

const PORT = 4000;
app.listen(PORT, (error) => {
    if (error) {
        console.log(`❌ Error while running the server on port ${PORT}:`, error);
    } else {
        console.log(`✅ Server started on http://localhost:${PORT}`);
    }
});
