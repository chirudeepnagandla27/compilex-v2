const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const dirCodes = path.join(__dirname, "codes");
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Generates a file with the given content and format.
 * For Java, it attempts to extract the public class name to use as the filename.
 * @param {string} format The file extension (e.g., 'cpp', 'py', 'java').
 * @param {string} content The code content to write to the file.
 * @returns {string} The full path to the generated file.
 */
const generateFile = (format, content) => {
    let filename;

    // Special handling for Java files: try to find the public class name
    if (format === 'java') {
        const publicClassRegex = /public\s+class\s+(\w+)/;
        const match = content.match(publicClassRegex);
        if (match && match[1]) {
            // Use the extracted class name as the filename
            filename = `${match[1]}.${format}`; // This will make it Main.java
        } else {
            // Fallback to UUID if no public class name is found (e.g., for non-public classes or tests)
            const jobID = uuidv4();
            filename = `${jobID}.${format}`;
        }
    } else {
        // For other languages, use a UUID as the filename
        const jobID = uuidv4();
        filename = `${jobID}.${format}`;
    }

    const filepath = path.join(dirCodes, filename);
    fs.writeFileSync(filepath, content);
    return filepath;
};

module.exports = { generateFile };
