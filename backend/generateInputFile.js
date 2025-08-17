const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const dirInput = path.join(__dirname, "codes");
if (!fs.existsSync(dirInput)) {
    fs.mkdirSync(dirInput, { recursive: true });
}

/**
 * Generates a file with the given input content.
 * This function is specifically for creating the input data file for the program.
 * @param {string} input The input content to write to the file.
 * @returns {string} The full path to the generated input file.
 */
const generateInputFile = (input) => {
    // For input files, we generally don't need language-specific naming.
    // A simple unique .txt file is sufficient.
    const jobID = uuidv4();
    const inputFileName = `${jobID}.txt`; // Always use .txt for input data

    const inputFilePath = path.join(dirInput, inputFileName);
    fs.writeFileSync(inputFilePath, input); // Write the input string to the file
    console.log(`Input file generated at: ${inputFilePath}`); // Added for debugging
    return inputFilePath;
};

module.exports = { generateInputFile };
