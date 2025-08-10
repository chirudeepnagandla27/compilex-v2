import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript'; // For general JS concepts
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism.css';
import axios from 'axios';
import './App.css'; // Assuming this has your body background image

function App() {
  // Map language values to their corresponding Prism.js highlighter and default code
  const languageMap = {
    cpp: {
      highlighter: languages.cpp,
      defaultCode: `#include <iostream>\n\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`
    },
    c: {
      highlighter: languages.c,
      defaultCode: `#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}`
    },
    py: {
      highlighter: languages.python,
      defaultCode: `print("Hello, World!")`
    },
    java: {
      highlighter: languages.java,
      defaultCode: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`
    },
  };

  const [code, setCode] = useState(languageMap.cpp.defaultCode);
  const [lang, setLang] = useState('cpp'); // Initialize language state to 'cpp'
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false); // State for run button loading

  // Effect to update code when language changes
  useEffect(() => {
    setCode(languageMap[lang].defaultCode);
  }, [lang]);

  const handleLangChange = (event) => {
    setLang(event.target.value);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput(''); // Clear previous output
    try {
      const payload = {
        language: lang,
        code: code
      };
      // Use VITE_BACKEND_URL from environment variables for flexible deployment
      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/run', payload);
      setOutput(data.output);
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside of 2xx range
        setOutput(`Error: ${error.response.status}\n${error.response.data.error || JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // Request was made but no response was received
        setOutput("Error: No response from server. Please ensure the backend server is running and accessible at " + (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/run'));
      } else {
        // Something happened in setting up the request that triggered an Error
        setOutput("Error: " + error.message);
      }
      console.error("Submission error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        AlgoU Online Code Compiler
      </h1>

      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Code Editor Section */}
        <div className="w-full md:w-2/3 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <select
              value={lang}
              onChange={handleLangChange}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="py">Python</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300
                ${isRunning ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400'}
              `}
              disabled={isRunning}
            >
              {isRunning ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                  </svg>
                  Run
                </span>
              )}
            </button>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => languageMap[lang].highlighter ? highlight(code, languageMap[lang].highlighter) : highlight(code, languages.clike)}
              padding={15}
              className="editor"
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                lineHeight: 1.5,
                backgroundColor: '#1e1e1e', // Darker background for code area
                color: '#d4d4d4', // Lighter text color
                minHeight: '400px', // Ensure a decent height
                overflowY: 'auto',
              }}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="w-full md:w-1/3 p-6 flex flex-col bg-gray-700">
          <h2 className="text-2xl font-bold mb-4">Output</h2>
          <div
            className="flex-1 bg-gray-900 p-4 rounded-lg overflow-auto border border-gray-600 whitespace-pre-wrap"
            style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 14 }}
          >
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
