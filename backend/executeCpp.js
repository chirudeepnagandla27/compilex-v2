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
        // Command to compile and then execute the C++ program
        // `g++ ${filepath} -o ${outPath}`: Compiles the C++ source file into an executable.
        // `&&`: Ensures the execution command runs only if compilation is successful.
        // `${outPath} < "${inputFilePath}"`: Executes the compiled program and redirects
        //                                     the content of inputFilePath as its standard input.
        //                                     Quotes around paths handle potential spaces.
        const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}" < "${inputFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                // If there's an error (e.g., compilation error, runtime error), reject with details
                console.error(`Execution error: ${error.message}`); // Log for debugging
                return reject({ error: error.message, stderr: stderr });
            }
            if (stderr) {
                // If there's content in stderr (warnings, or some runtime errors), reject with it
                console.error(`Stderr output: ${stderr}`); // Log for debugging
                return reject(stderr);
            }
            // If successful, resolve with the stdout
            resolve(stdout);
        });
    });
};

module.exports = { executeCpp };
