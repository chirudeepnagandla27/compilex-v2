// executeJava.js
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Define the directory for outputs, similar to executeCpp.js
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// !!! IMPORTANT: Replace 'YOUR_JAVA_BIN_PATH' with your actual path !!!
// Based on your earlier screenshots, this should be:
// const JAVA_BIN_PATH = "C:\\Program Files\\Java\\jdk-24\\bin";
// Make sure to use double backslashes (\\) or forward slashes (/) for paths in JavaScript strings.
const JAVA_BIN_PATH = "C:\\Program Files\\Java\\jdk-24\\bin"; // <-- VERIFY AND UPDATE THIS LINE

/**
 * Compiles and executes a Java file and returns its stdout or stderr.
 * Assumes the Java file contains a public class named 'Main' (or the filename without .java).
 * @param {string} filepath The path to the Java file (e.g., /codes/some_id.java).
 * @returns {Promise<string>} A promise that resolves with stdout or rejects with stderr/error.
 */
const executeJava = (filepath) => {
    return new Promise((resolve, reject) => {
        const dirPath = path.dirname(filepath);
        const className = path.basename(filepath).split('.')[0];

        // Construct full paths to javac and java executables
        const javacCommand = path.join(JAVA_BIN_PATH, 'javac.exe');
        const javaCommand = path.join(JAVA_BIN_PATH, 'java.exe');

        // Step 1: Compile the Java file using the absolute path to javac
        // Use quotes around paths with spaces to prevent issues
        exec(
            `"${javacCommand}" "${filepath}" -d "${dirPath}"`,
            (compileError, compileStdout, compileStderr) => {
                if (compileError) {
                    // console.error(`Java Compilation Error (from executeJava): ${compileError.message}`);
                    return reject({ error: compileError, stderr: compileStderr });
                }
                if (compileStderr) {
                    // console.warn(`Java Compilation Warnings/Errors (stderr from executeJava): ${compileStderr}`);
                }

                // Step 2: Execute the compiled Java class using the absolute path to java
                // Use quotes around paths with spaces to prevent issues
                exec(
                    `"${javaCommand}" -cp "${dirPath}" "${className}"`,
                    (execError, execStdout, execStderr) => {
                        if (execError) {
                            // console.error(`Java Execution Error (from executeJava): ${execError.message}`);
                            return reject({ error: execError, stderr: execStderr });
                        }
                        if (execStderr) {
                            // console.warn(`Java Execution Warnings/Errors (stderr from executeJava): ${execStderr}`);
                        }
                        resolve(execStdout);
                    }
                );
            }
        );
    });
};

// Export the executeJava function so it can be required by other modules (like index.js)
module.exports = {
    executeJava,
};
