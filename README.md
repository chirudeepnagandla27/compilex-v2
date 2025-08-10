# AlgoU Online Code Compiler

An end-to-end web application that lets you write, compile, and execute code directly in the browser.

The project is split into two independently runnable parts:

1.  **backend** - A lightweight Express server that receives source-code, stores it temporarily, compiles it with `g++`, `python`, and `java`, and then streams the program output back to the client.
2.  **frontend** - A React + Vite single-page application that provides a minimal online IDE and communicates with the backend via REST.

---

## ✨ Features

* Live, in-browser code editing powered by `react-simple-code-editor` and Prism syntax highlighting.
* One-click **Run** button – code is POSTed to the server, compiled, and the result appears instantly below the editor.
* Modular execution pipeline – currently supports **C++, C, Python, and Java**. Adding more languages is as simple as creating an `execute<LANG>.js` helper and a small switch-case in `index.js`.

---

## 🚀 Installation

These commands assume you have Node.js (>= 18) and npm installed.

1.  **Clone the repo & move into the project folder:**
    ```bash
    git clone https://github.com/chirudeepnagandla27/compilex.git
    cd compilex
    ```

2.  **Install dependencies for both workspaces:**

    * Back-end
        ```bash
        cd backend && npm install
        ```
    * Front-end
        ```bash
        cd frontend && npm install
        ```

3.  **(Optional) Copy the environment variable template and tweak if necessary:**
    ```bash
    cp backend/.env.example backend/.env
    ```
    (Note: You might need to manually create `.env` and add your `VITE_BACKEND_URL` if not using a specific `.env.example` file. For local testing, your backend runs on `http://localhost:4000`.)

---

## ▶️ Running the project

1.  **Ensure language runtimes are installed:**
    * **C/C++:** `g++` compiler (e.g., from MinGW on Windows, or build-essentials on Linux/macOS)
    * **Python:** `python` or `python3` interpreter
    * **Java:** Java Development Kit (JDK), including `javac` (compiler) and `java` (runtime)

2.  **Start the backend server:**
    ```bash
    cd backend
    node index.js
    ```
    (The server will start on `http://localhost:4000`)

3.  **Start the frontend development server:**
    ```bash
    cd frontend
    npm run dev
    ```
    (The frontend will typically start on `http://localhost:5173`)

Now, open your browser to `http://localhost:5173` to access the compiler!