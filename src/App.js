import React, { useState, useEffect } from 'react';
import { AlertCircle, Moon, Sun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

const BrainfuckInterpreter = () => {
  const [code, setCode] = useState('++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState(Array(30000).fill(0));
  const [pointer, setPointer] = useState(0);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const interpret = () => {
    let result = '';
    let i = 0;
    let loopStack = [];
    let memoryArray = [...memory];
    let currentPointer = pointer;

    const incrementPointer = () => {
      currentPointer = (currentPointer + 1) % 30000;
    };

    const decrementPointer = () => {
      currentPointer = (currentPointer - 1 + 30000) % 30000;
    };

    while (i < code.length) {
      switch (code[i]) {
        case '>':
          incrementPointer();
          break;
        case '<':
          decrementPointer();
          break;
        case '+':
          memoryArray[currentPointer] = (memoryArray[currentPointer] + 1) % 256;
          break;
        case '-':
          memoryArray[currentPointer] = (memoryArray[currentPointer] - 1 + 256) % 256;
          break;
        case '.':
          result += String.fromCharCode(memoryArray[currentPointer]);
          break;
        case ',':
          if (input.length > 0) {
            memoryArray[currentPointer] = input.charCodeAt(0);
            setInput(input.slice(1));
          }
          break;
        case '[':
          if (memoryArray[currentPointer] === 0) {
            let loopCount = 1;
            while (loopCount > 0) {
              i++;
              if (i >= code.length) {
                setError('Unmatched [');
                return;
              }
              if (code[i] === '[') loopCount++;
              if (code[i] === ']') loopCount--;
            }
          } else {
            loopStack.push(i);
          }
          break;
        case ']':
          if (memoryArray[currentPointer] !== 0) {
            if (loopStack.length === 0) {
              setError('Unmatched ]');
              return;
            }
            i = loopStack[loopStack.length - 1];
          } else {
            loopStack.pop();
          }
          break;
      }
      i++;
    }

    setOutput(result);
    setMemory(memoryArray);
    setPointer(currentPointer);
  };

  useEffect(() => {
    const highlightSyntax = (code) => {
      return code.replace(/([><+\-.,[\]])/g, '<span class="$1">$1</span>');
    };

    const codeElement = document.getElementById('code');
    if (codeElement) {
      codeElement.innerHTML = highlightSyntax(code);
    }
  }, [code]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-r ${darkMode ? 'from-gray-800 via-gray-900 to-black' : 'from-purple-400 via-pink-500 to-red-500'} p-8 transition-colors duration-300`}>
      <div className={`w-full max-w-4xl ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 duration-300 relative`}>
        <div className={`absolute top-2 right-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center text-sm`}>
          <span className="mr-2">DM suggestions:</span>
          <a
            href="https://discord.com/users/thatzsid"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-300`}
          >
            <img
              src="./discord.svg"
              alt="Discord"
              className="w-4 h-4 mr-1 fill-current"
            />
            thatzsid
          </a>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} animate-pulse`}>Brainfuck Interpreter</h1>
            <button
              onClick={() => setDarkMode(prevMode => !prevMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'} transition-colors duration-300`}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <div className="mb-6">
            <label htmlFor="code" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Brainfuck Code:</label>
            <div
              id="code"
              className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} p-4 rounded-md font-mono text-sm h-40 overflow-auto whitespace-pre-wrap`}
              contentEditable
              onInput={(e) => setCode(e.target.innerText)}
              dangerouslySetInnerHTML={{ __html: code }}
            ></div>
          </div>

          <div className="mb-6">
            <label htmlFor="input" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Input:</label>
            <input
              id="input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <button
            onClick={interpret}
            className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md transition-colors duration-300 transform hover:scale-105`}
          >
            Run
          </button>

          {error && (
            <Alert variant="destructive" className={`mt-4 ${darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-900'}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Output:</h2>
            <pre className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} p-4 rounded-md font-mono text-sm overflow-auto whitespace-pre-wrap`}>{output}</pre>
          </div>

          <div className="mt-6">
            <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Memory:</h2>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-md overflow-x-auto`}>
              <div className="flex space-x-1">
                {memory.slice(0, 30).map((cell, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 flex items-center justify-center text-xs ${
                      index === pointer
                        ? 'bg-blue-500 text-white font-bold rounded-full'
                        : 'bg-gray-300'
                    }`}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainfuckInterpreter;
