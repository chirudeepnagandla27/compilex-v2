const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the outputs directory exists (though Python doesn't typically create executables here)
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Executes a Python file, redirecting input from a specified file.
 * @param {string} filepath The absolute path to the Python source file.
 * @param {string} inputFilePath The absolute path to the input data file.
 * @returns {Promise<string>} A promise that resolves with the stdout of the executed program,
 * or rejects with an error object containing details (error and stderr).
 */
const executePy = (filepath, inputFilePath) => {
    return new Promise((resolve, reject) => {
        // Command to execute the Python program and pipe the input file
        // `python "${filepath}" < "${inputFilePath}"`: Runs the Python script
        //                                            and redirects inputFilePath content to its stdin.
        //                                            Quotes around paths handle potential spaces.
        const command = `python "${filepath}" < "${inputFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                // If there's an error (e.g., syntax error, runtime error), reject with details
                console.error(`Python execution error: ${error.message}`); // Log for debugging
                return reject({ error: error.message, stderr: stderr });
            }
            if (stderr) {
                // If there's content in stderr (warnings, or some runtime errors), reject with it
                console.error(`Python stderr output: ${stderr}`); // Log for debugging
                return reject(stderr);
            }
            // If successful, resolve with the stdout
            resolve(stdout);
        });
    });
};

module.exports = { executePy };
