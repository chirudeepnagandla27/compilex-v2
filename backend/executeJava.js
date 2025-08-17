const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the outputs directory exists (for compiled .class files)
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and executes a Java file, redirecting input from a specified file.
 * @param {string} filepath The absolute path to the Java source file (e.g., /path/to/Main.java).
 * @param {string} inputFilePath The absolute path to the input data file.
 * @returns {Promise<string>} A promise that resolves with the stdout of the executed program,
 * or rejects with an error object containing details (error and stderr).
 */
const executeJava = (filepath, inputFilePath) => {
    return new Promise((resolve, reject) => {
        // Extract the directory containing the Java source file
        const codeDir = path.dirname(filepath);
        // Extract the base name (e.g., 'Main.java' -> 'Main')
        const className = path.basename(filepath, '.java'); // This assumes filename is class name

        // 1. Compile the Java source file
        // `javac -d "${outputPath}" "${filepath}"`: Compiles Java source and places .class in outputPath.
        const compileCommand = `javac -d "${outputPath}" "${filepath}"`;

        exec(compileCommand, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                console.error(`Java compilation error: ${compileError.message}`);
                return reject({ error: compileError.message, stderr: compileStderr });
            }
            if (compileStderr) {
                console.error(`Java compilation stderr: ${compileStderr}`);
                // Often, stderr during compile is still an error or warning to report
                return reject(compileStderr);
            }

            // 2. Execute the compiled Java class with input redirection
            // `java -cp "${outputPath}" "${className}" < "${inputFilePath}"`:
            //   -cp "${outputPath}": Sets the classpath to where the .class file is located.
            //   "${className}": The name of the main class to execute.
            //   < "${inputFilePath}": Redirects content of inputFilePath to standard input.
            const runCommand = `java -cp "${outputPath}" "${className}" < "${inputFilePath}"`;

            exec(runCommand, (runError, runStdout, runStderr) => {
                if (runError) {
                    console.error(`Java runtime error: ${runError.message}`);
                    return reject({ error: runError.message, stderr: runStderr });
                }
                if (runStderr) {
                    console.error(`Java runtime stderr: ${runStderr}`);
                    return reject(runStderr);
                }
                resolve(runStdout);
            });
        });
    });
};

module.exports = { executeJava };
