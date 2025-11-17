"use client";

import { useState, useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

export default function NotebookDemo() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [cells, setCells] = useState([
    {
      id: 1,
      code: `# Welcome to AI/ML Notebook Demo
# This notebook runs Python with popular ML libraries in your browser!

print("Hello from Pyodide!")
import sys
print(f"Python version: {sys.version}")`,
      output: "",
      isRunning: false,
      type: "code",
    },
    {
      id: 2,
      code: `# Import popular AI/ML libraries
import numpy as np
import pandas as pd

print("NumPy version:", np.__version__)
print("Pandas version:", pd.__version__)

# Create a simple array
arr = np.array([1, 2, 3, 4, 5])
print("\\nNumPy array:", arr)
print("Mean:", np.mean(arr))`,
      output: "",
      isRunning: false,
      type: "code",
    },
    {
      id: 3,
      code: `# Pandas DataFrame example
import pandas as pd

data = {
    'name': ['Alice', 'Bob', 'Charlie', 'David'],
    'age': [25, 30, 35, 28],
    'score': [85, 92, 78, 88]
}

df = pd.DataFrame(data)
print(df)
print("\\nAverage score:", df['score'].mean())`,
      output: "",
      isRunning: false,
      type: "code",
    },
    {
      id: 4,
      code: `# Machine Learning with scikit-learn
import numpy as np
from sklearn.linear_model import LinearRegression

# Simple linear regression example
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

model = LinearRegression()
model.fit(X, y)

prediction = model.predict([[6]])
print(f"Prediction for x=6: {prediction[0]}")
print(f"Coefficient: {model.coef_[0]}")
print(f"Intercept: {model.intercept_}")`,
      output: "",
      isRunning: false,
      type: "code",
    },
    {
      id: 5,
      code: `# Neural Network with scikit-learn
from sklearn.neural_network import MLPClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# Create a sample dataset
X, y = make_classification(n_samples=200, n_features=4, 
                           n_informative=3, n_redundant=1, 
                           random_state=42)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train neural network
nn = MLPClassifier(hidden_layer_sizes=(10, 5), 
                   max_iter=1000, random_state=42)
nn.fit(X_train, y_train)

# Evaluate
train_score = nn.score(X_train, y_train)
test_score = nn.score(X_test, y_test)

print(f"Training accuracy: {train_score:.4f}")
print(f"Test accuracy: {test_score:.4f}")
print("For deep learning, use TensorFlow.js with JavaScript!")`,
      output: "",
      isRunning: false,
      type: "code",
    },
  ]);

  useEffect(() => {
    loadPyodide();
  }, []);

  const loadPyodide = async () => {
    try {
      console.log("Starting Pyodide load...");
      setLoading(true);
      setLoadError(null);

      // Load Pyodide from CDN
      if (!window.loadPyodide) {
        console.log("Loading Pyodide script from CDN...");
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        console.log("Pyodide script loaded");
      }

      const pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });
      console.log("Pyodide instance loaded");

      // Load popular ML packages
      console.log("Loading packages...");
      await pyodideInstance.loadPackage([
        "numpy",
        "pandas",
        "scikit-learn",
        "matplotlib",
        "micropip",
      ]);
      console.log("Packages loaded successfully");

      // Note: TensorFlow (Python) is not available in Pyodide
      // For deep learning in browser, use TensorFlow.js (JavaScript)

      setPyodide(pyodideInstance);
      setLoading(false);
      console.log("Pyodide ready!");
    } catch (error) {
      console.error("Failed to load Pyodide:", error);
      setLoadError(error.message);
      setLoading(false);
    }
  };

  const runCell = async (cellId) => {
    console.log("=== runCell called ===");
    console.log("Cell ID:", cellId);
    console.log("Pyodide loaded?", !!pyodide);

    if (!pyodide) {
      console.log("❌ Pyodide not loaded yet");
      alert(
        "Python environment is not loaded yet. Please wait for the loading to complete."
      );
      return;
    }

    const cell = cells.find((c) => c.id === cellId);
    if (!cell) {
      console.log("❌ Cell not found:", cellId);
      return;
    }

    console.log("✓ Running cell:", cellId);
    console.log("Cell code:", cell.code);

    // Set running state and clear output
    setCells((prevCells) =>
      prevCells.map((c) =>
        c.id === cellId ? { ...c, isRunning: true, output: "Running..." } : c
      )
    );

    try {
      // Reset stdout and stderr for this execution
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Run the code
      await pyodide.runPythonAsync(cell.code);

      // Get the output and error
      const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
      const errorOutput = await pyodide.runPythonAsync("sys.stderr.getvalue()");

      let finalOutput = output;
      if (errorOutput && errorOutput.trim()) {
        finalOutput += "\n[stderr]\n" + errorOutput;
      }
      if (!finalOutput.trim()) {
        finalOutput = "Code executed successfully (no output).";
      }

      console.log("✓ Cell output:", finalOutput);

      setCells((prevCells) =>
        prevCells.map((c) =>
          c.id === cellId ? { ...c, isRunning: false, output: finalOutput } : c
        )
      );
    } catch (error) {
      console.error("❌ Cell execution error:", error);
      setCells((prevCells) =>
        prevCells.map((c) =>
          c.id === cellId
            ? { ...c, isRunning: false, output: `Error: ${error.message}` }
            : c
        )
      );
    }
  };

  const updateCellCode = (cellId, newCode) => {
    setCells(cells.map((c) => (c.id === cellId ? { ...c, code: newCode } : c)));
  };

  const addCell = () => {
    const newId = Math.max(...cells.map((c) => c.id)) + 1;
    setCells([
      ...cells,
      {
        id: newId,
        code: "# Write your Python code here\n",
        output: "",
        isRunning: false,
        type: "code",
      },
    ]);
  };

  const deleteCell = (cellId) => {
    if (cells.length > 1) {
      setCells(cells.filter((c) => c.id !== cellId));
    }
  };

  const runAllCells = async () => {
    for (const cell of cells) {
      await runCell(cell.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1225] via-[#121522] to-[#1a1f35] text-white pt-[180px]">
      {/* Header */}
      <div className="fixed top-[80px] left-0 right-0 z-40 bg-[#0a1225]/95 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI/ML Notebook Demo
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Run Python with NumPy, Pandas, and Scikit-learn in your browser
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log("Run All button clicked!");
                  runAllCells();
                }}
                disabled={loading || loadError}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                {loading ? "Loading..." : "Run All"}
              </button>
              <button
                onClick={() => {
                  console.log("Add Cell button clicked!");
                  addCell();
                }}
                disabled={loading || loadError}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                + Add Cell
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notebook Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">
              Loading Python environment and ML libraries...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a minute on first load
            </p>
          </div>
        )}

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Failed to Load Python Environment
            </h3>
            <p className="text-red-300">{loadError}</p>
            <button
              onClick={loadPyodide}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <div className="space-y-4">
            {cells.map((cell, index) => (
              <NotebookCell
                key={cell.id}
                cell={cell}
                index={index}
                onRun={() => runCell(cell.id)}
                onDelete={() => deleteCell(cell.id)}
                onCodeChange={(newCode) => updateCellCode(cell.id, newCode)}
                canDelete={cells.length > 1}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        {!loading && !loadError && (
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-blue-400">
              Available Libraries:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  <strong>NumPy</strong> - Numerical computing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  <strong>Pandas</strong> - Data manipulation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  <strong>Scikit-learn</strong> - Machine learning & Neural
                  Networks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  <strong>Matplotlib</strong> - Data visualization
                </span>
              </div>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              💡 Note: All code runs in your browser using Pyodide (Python
              compiled to WebAssembly)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotebookCell({
  cell,
  index,
  onRun,
  onDelete,
  onCodeChange,
  canDelete,
}) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      viewRef.current = new EditorView({
        doc: cell.code,
        extensions: [
          basicSetup,
          python(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onCodeChange(update.state.doc.toString());
            }
          }),
        ],
        parent: editorRef.current,
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-[#1a1f35] border border-blue-500/20 rounded-lg overflow-hidden">
      {/* Cell Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a1225] border-b border-blue-500/20">
        <span className="text-sm font-mono text-gray-400">
          In [{index + 1}]:
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log("Cell Run button clicked for index:", index + 1);
              onRun();
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Run
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div ref={editorRef} className="text-sm" />

      {/* Output */}
      <div className="border-t border-blue-500/20">
        <div className="px-4 py-2 bg-[#0a1225] border-b border-blue-500/20">
          <span className="text-sm font-mono text-gray-400">
            Out [{index + 1}]:
          </span>
        </div>
        {cell.isRunning ? (
          <div className="p-4 text-sm font-mono text-yellow-400">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
              Running...
            </div>
          </div>
        ) : cell.output ? (
          <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
            {cell.output}
          </pre>
        ) : (
          <div className="p-4 text-sm font-mono text-gray-500 italic">
            No output yet. Click "Run" to execute this cell.
          </div>
        )}
      </div>
    </div>
  );
}
