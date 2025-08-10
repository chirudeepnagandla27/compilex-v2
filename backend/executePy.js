// executePy.js
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Define the directory for outputs
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Executes a Python script and returns its stdout or stderr.
 * @param {string} filepath The path to the Python file.
 * @returns {Promise<string>} A promise that resolves with stdout or rejects with stderr/error.
 */
const executePy = (filepath) => {
    return new Promise((resolve, reject) => {
        // *** CHANGE MADE HERE: Using 'python' instead of 'python3' for Windows compatibility ***
        exec(
            `python ${filepath}`, // Changed from `python3` to `python`
            (error, stdout, stderr) => {
                // If there's an execution error (e.g., syntax error, runtime error)
                if (error) {
                    return reject({ error, stderr });
                }
                // If there's stderr output but no 'error' object (e.g., warnings)
                if (stderr) {
                    return reject(stderr);
                }
                // Resolve with the standard output if execution is successful
                resolve(stdout);
            }
        );
    });
};

module.exports = {
    executePy,
};
