const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the outputs directory exists
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and executes a C++ file, redirecting input from a specified file.
 * @param {string} filepath The absolute path to the C++ source file.
 * @param {string} inputFilePath The absolute path to the input data file.
 * @returns {Promise<string>} A promise that resolves with the stdout of the executed program,
 * or rejects with an error object containing details (error and stderr).
 */
const executeCpp = (filepath, inputFilePath) => {
    // Extract jobID from the filepath (e.g., 'your-code.cpp' -> 'your-code')
    const jobID = path.basename(filepath).split('.')[0];
    // Define the output path for the executable
    const outPath = path.join(outputPath, `${jobID}.exe`); // Using .exe for Windows, adjust for Linux/macOS if needed (no extension)

    return new Promise((resolve, reject) => {
        // Add compile warnings and standard, and use linux timeout to prevent infinite loops
        const compile = `g++ -std=c++17 -O2 -pipe "${filepath}" -o "${outPath}"`;
        // Run with a 3s timeout; adjust as needed. Use input redirection.
        const run = `timeout 3s "${outPath}" < "${inputFilePath}"`;
        const command = `${compile} && ${run}`;

        exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`); // Log for debugging
                return reject({ error: error.message, stderr: stderr });
            }
            if (stderr) {
                console.error(`Stderr output: ${stderr}`); // Log for debugging
                return reject(stderr);
            }
            resolve(stdout);
        });
    });
};

module.exports = { executeCpp };
