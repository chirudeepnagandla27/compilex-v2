import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import ReactMarkdown from 'react-markdown';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css';
import axios from 'axios';
import './App.css';

function App() {
  const [language, setLanguage] = useState('cpp');
  const starterCodeByLang = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    int num1, num2, sum;
    cin >> num1 >> num2;
    sum = num1 + num2;
    cout << "The sum of the two numbers is: " << sum;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int a, b; scanf("%d %d", &a, &b);
    printf("%d\n", a + b);
    return 0;
}`,
    py: `def main():
    a, b = map(int, input().split())
    print(a + b)

if __name__ == "__main__":
    main()`,
    java: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int a = sc.nextInt();
    int b = sc.nextInt();
    System.out.println(a + b);
  }
}`
  };

  const [code, setCode] = useState(starterCodeByLang.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [aiReview, setAiReview] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const prismLanguageMap = {
    cpp: languages.cpp || languages.clike,
    c: languages.c || languages.clike,
    py: languages.python || languages.js,
    java: languages.java || languages.clike,
  };

  const handleRun = async () => {
    const payload = {
      language,
      code,
      input
    };

    try {
      setIsRunning(true);
      setOutput('');
      const { data } = await axios.post(`${API_BASE}/run`, payload);
      setOutput(data.output);
    } catch (error) {
      setOutput('Error executing code, error: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiReview = async () => {
    const payload = { code };

    try {
      setIsReviewing(true);
      setAiReview('');
      const { data } = await axios.post(`${API_BASE}/ai-review`, payload);
      setAiReview(data.review);
    } catch (error) {
      setAiReview('Error in AI review, error: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsReviewing(false);
    }
  };

  const onChangeLanguage = (e) => {
    const nextLang = e.target.value;
    setLanguage(nextLang);
    setCode(starterCodeByLang[nextLang] || '');
    setOutput('');
    setAiReview('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">AlgoU Online Code Compiler</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Code Editor Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-700">Code Editor</h2>
            <select value={language} onChange={onChangeLanguage} className="border rounded px-2 py-1 text-sm">
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="py">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className="bg-gray-100 rounded-lg overflow-y-auto flex-grow" style={{ height: '500px' }}>
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => highlight(code, prismLanguageMap[language] || languages.js)}
              padding={15}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '500px'
              }}
            />
          </div>
        </div>

        {/* Input, Output, AI Review */}
        <div className="flex flex-col gap-4">
          {/* Input Box */}
          <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Input</h2>
            <textarea
              rows="4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input values..."
              className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none"
            />
          </div>

          {/* Output Box */}
          <div className="bg-white shadow-lg rounded-lg p-4 overflow-y-auto" style={{ height: '150px' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Output</h2>
              {isRunning && <span className="text-xs text-gray-500">Running...</span>}
            </div>
            <div className="text-sm font-mono whitespace-pre-wrap text-gray-800">{output}</div>
          </div>

          {/* AI Review Box */}
          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-700">AI Review</h2>
              {isReviewing && <span className="text-xs text-gray-500">Reviewing...</span>}
            </div>
            <div className="prose prose-sm text-gray-800 overflow-y-auto" style={{ height: '150px' }}>
              {
                aiReview === '' ?
                  <div>🤖</div> :
                  <ReactMarkdown>
                    {aiReview}
                  </ReactMarkdown>
              }
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={handleRun}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleAiReview}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
              disabled={isReviewing}
            >
              {isReviewing ? 'Reviewing...' : 'AI Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;