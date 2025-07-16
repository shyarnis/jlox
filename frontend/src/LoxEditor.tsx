import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Code, FileText, Zap, Book, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import './LoxEditor.css';

interface LoxResponse {
	success: boolean;
	output?: string;
	error?: string;
}

interface LoxExample {
	[key: string]: string;
}

const LoxEditor: React.FC = () => {
  const [code, setCode] = useState<string>('print "Hello, World!";');
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [examples, setExamples] = useState<LoxExample>({});
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [lastExecutionStatus, setLastExecutionStatus] = useState<'success' | 'error' | null>(null);
  const [showGrammarModal, setShowGrammarModal] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/lox`;

  // Use useCallback to ensure the function reference is stable
  const executeCode = useCallback(async () => {
    // Always get the current code from the editor
    const currentCode = editorRef.current?.getValue() || code;
    
    if (!currentCode.trim()) {
      setOutput('Error: Code is required');
      setLastExecutionStatus('error');
      return;
    }

    setIsExecuting(true);
    setOutput('Executing...');
    setLastExecutionStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: currentCode }),
      });

      const result: LoxResponse = await response.json();
      
      if (result.success) {
        setOutput(result.output || 'Execution completed successfully');
        setLastExecutionStatus('success');
      } else {
        setOutput(result.error || 'Unknown error occurred');
        setLastExecutionStatus('error');
      }
    } catch (error) {
      setOutput(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLastExecutionStatus('error');
    } finally {
      setIsExecuting(false);
    }
  }, [code, API_BASE_URL]);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/examples`);
      const data = await response.json();
      setExamples(data.examples);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    }
  };

  const loadExample = (exampleName: string) => {
    if (examples[exampleName]) {
      setCode(examples[exampleName]);
      setSelectedExample(exampleName);
      setOutput('');
      setLastExecutionStatus(null);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcut for execution (Ctrl+Enter or Cmd+Enter)
    editor.addAction({
      id: 'execute-code',
      label: 'Execute Code',
      keybindings: [
        (window as any).monaco.KeyMod.CtrlCmd | (window as any).monaco.KeyCode.Enter
      ],
      run: executeCode
    });
  };

  const getStatusIcon = () => {
    if (isExecuting) return <Zap size={16} className="lox-spinning" />;
    if (lastExecutionStatus === 'success') return <CheckCircle size={16} style={{ color: '#10b981' }} />;
    if (lastExecutionStatus === 'error') return <AlertCircle size={16} style={{ color: '#ef4444' }} />;
    return <Play size={16} />;
  };

  const GrammarModal = () => (
    <div className="lox-modal-overlay" onClick={() => setShowGrammarModal(false)}>
      <div className="lox-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lox-modal-header">
          <h2 className="lox-modal-title">
            <Book size={20} />
            Lox Language Reference
          </h2>
          <button 
            className="lox-modal-close"
            onClick={() => setShowGrammarModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="lox-modal-content">
          <div className="lox-modal-section">
            <h3>About Lox</h3>
            <p>
              Lox is a dynamically typed, object-oriented programming language designed for learning interpreter implementation. 
              It's featured in the book "Crafting Interpreters" by Robert Nystrom as an educational tool to understand 
              how programming languages work under the hood.
            </p>
            <p>
              This implementation follows the tree-walk interpreter approach, where the source code is parsed into an 
              Abstract Syntax Tree (AST) and then executed by traversing the tree structure.
            </p>
          </div>

          <div className="lox-modal-section">
            <h3>Language Features</h3>
            <div className="lox-features">
              <div className="lox-feature">
                <h4>Data Types</h4>
                <p>Booleans, numbers, strings, and nil values with automatic type conversion where appropriate.</p>
              </div>
              <div className="lox-feature">
                <h4>Variables</h4>
                <p>Dynamic typing with var declarations and lexical scoping rules.</p>
              </div>
              <div className="lox-feature">
                <h4>Functions</h4>
                <p>First-class functions with closures, recursion, and local function definitions.</p>
              </div>
              <div className="lox-feature">
                <h4>Classes</h4>
                <p>Object-oriented programming with classes, inheritance, and method binding.</p>
              </div>
              <div className="lox-feature">
                <h4>Control Flow</h4>
                <p>if/else statements, while and for loops, and logical operators.</p>
              </div>
              <div className="lox-feature">
                <h4>Built-ins</h4>
                <p>Print statements, arithmetic operations, and comparison operators.</p>
              </div>
            </div>
          </div>

          <div className="lox-modal-section">
            <h3>Grammar</h3>
            <div className="lox-grammar">
{`program        → statement* EOF ;
declaration    → classDecl
               | funDecl
               | varDecl
               | statement ;
classDecl      → "class" IDENTIFIER ( "<" IDENTIFIER )?
               "{" function* "}" ;             
                 
funDecl        → "fun" function ;
function       → IDENTIFIER "(" parameters? ")" block ;             
parameters     → IDENTIFIER ( "," IDENTIFIER )* ;
                 
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
statement      → exprStmt
               | forStmt
               | ifStmt
               | printStmt
               | returnStmt
               | whileStmt
               | block ;
returnStmt     → "return" expression? ";" ;
forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
                 expression? ";"
                 expression? ")" statement ;
whileStmt      → "while" "(" expression ")" statement ;
ifStmt         → "if" "(" expression ")" statement
                 ( "else" statement )? ;
block          → "{" declaration* "}" ;
exprStmt       → expression ";" ;
printStmt      → "print" expression ";" ;
expression     → assignment ;
assignment     → ( call "." )? IDENTIFIER "=" assignment
               | logic_or ;
               
logic_or       → logic_and ( "or" logic_and )* ;
logic_and      → equality ( "and" equality )* ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary | call ;
call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
arguments      → expression ( "," expression )* ;
primary        → "true" | "false" | "nil" | "this"
               | NUMBER | STRING | IDENTIFIER | "(" expression ")"
               | "super" "." IDENTIFIER ;`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lox-container">
      {/* Header */}
      <header className="lox-header">
        <div className="lox-header-content">
          <div className="lox-title">
            <Code size={32} style={{ color: '#60a5fa' }} />
            <h1 className="lox-title-text">Lox Interpreter</h1>
          </div>
          <div className="lox-controls">
            <button
              className="lox-info-button"
              onClick={() => setShowGrammarModal(true)}
            >
              <Info size={16} />
              <span>Language Info</span>
            </button>
            <select
              className="lox-select"
              value={selectedExample}
              onChange={(e) => loadExample(e.target.value)}
            >
              <option value="">Select Example</option>
              {Object.keys(examples).map((exampleName) => (
                <option key={exampleName} value={exampleName}>
                  {exampleName}
                </option>
              ))}
            </select>
            <button
              className="lox-button"
              onClick={executeCode}
              disabled={isExecuting}
            >
              {getStatusIcon()}
              <span>{isExecuting ? 'Executing...' : 'Run Code'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lox-main-content">
        {/* Code Editor */}
        <div className="lox-editor-section">
          <div className="lox-section-header">
            <div className="lox-section-title">
              <FileText size={16} style={{ color: '#9ca3af' }} />
              <span>Code Editor</span>
            </div>
            <span className="lox-shortcut">Press Ctrl+Enter to execute</span>
          </div>
          <div className="lox-editor-container">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                contextmenu: true,
                selectOnLineNumbers: true,
                glyphMargin: true,
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                matchBrackets: 'always',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="lox-output-panel">
          <div className="lox-output-header">
            <div className="lox-section-title">
              <Book size={16} style={{ color: '#9ca3af' }} />
              <span>Output</span>
            </div>
            {lastExecutionStatus && (
              <div className="lox-status">
                {lastExecutionStatus === 'success' ? (
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                ) : (
                  <AlertCircle size={16} style={{ color: '#ef4444' }} />
                )}
                <span className="lox-status-text" style={{
                  color: lastExecutionStatus === 'success' ? '#4ade80' : '#f87171'
                }}>
                  {lastExecutionStatus === 'success' ? 'Success' : 'Error'}
                </span>
              </div>
            )}
          </div>
          <div className="lox-output-content">
            <pre className={`lox-output ${lastExecutionStatus === 'error' ? 'lox-output-error' : ''}`}>
              {output || 'No output yet. Click "Run Code" to execute your Lox program.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="lox-footer">
        <div className="lox-footer-content">
          <div className="lox-footer-left">
            <span>Built with </span>
            <a 
              href="https://craftinginterpreters.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="lox-footer-link"
            >
              Crafting Interpreters
            </a>
            <span></span>
          </div>
          <span>
          <a href="https://craftinginterpreters.com/the-lox-language.html" className='lox-footer-link'>Lox Language</a> Interpreter</span>
        </div>
      </footer>

      {/* Grammar Modal */}
      {showGrammarModal && <GrammarModal />}
    </div>
  );
};

export default LoxEditor;