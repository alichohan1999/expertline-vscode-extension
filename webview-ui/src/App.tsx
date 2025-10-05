import { useEffect, useState } from "react";
import { VSCodeButton, VSCodeTextArea, VSCodeDropdown, VSCodeOption, VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';

import { vscode } from "./utilities/vscode";
import './App.css';
import logoSvg from './assets/expertline-logo.svg';

// Helper function to show messages using window.showInformationMessage
function showMessage(message: string, type: 'info' | 'error' | 'warning' = 'info') {
  if (window.showInformationMessage) {
    window.showInformationMessage(message);
  } else {
    // Fallback for environments where window.showInformationMessage is not available
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}

interface WebviewState {
  code?: string;
  additionalContext?: string;
  mode?: string;
  apiResponse?: ApiResponse | null;
  isAutoMode?: boolean;
  showResults?: boolean;
}

interface Comparison {
  name: string;
  summary: string;
  pros: string[];
  cons: string[];
  complexity: string;
  codeBlock: string;
  referenceLink: string;
  referenceType: string;
  isBaseline?: boolean;
  originalPost?: {
    id: string;
    title: string;
    categories: string[];
    subTopics: string[];
    description: string;
    endorse: number;
    oppose: number;
    eoRatio: number;
    endorseRate: number;
    username: string;
    createdAt: string;
    updatedAt: string;
    isBaseline?: boolean;
    authorId?: string;
    author?: {
      username: string;
    };
  };
}

interface ApiResponse {
  mode: string;
  comparisons: Comparison[];
  message?: string; // AI mode can include a message
}

// Removed mock data - using real API endpoint

function App() {
  // Initialize state from VS Code webview state or defaults
  const [code, setCode] = useState(() => {
    const state = vscode.getState() as WebviewState;
    return state?.code || "First select code and press ALT + X to see the results.";
  });
  const [additionalContext, setAdditionalContext] = useState(() => {
    const state = vscode.getState() as WebviewState;
    return state?.additionalContext || "";
  });
  const [mode, setMode] = useState(() => {
    const state = vscode.getState() as WebviewState;
    return state?.mode || "expert";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(() => {
    const state = vscode.getState() as WebviewState;
    return state?.apiResponse || null;
  });
  const [isAutoMode, setIsAutoMode] = useState(() => {
    const state = vscode.getState() as WebviewState;
    return state?.isAutoMode || false;
  });
  const [showResults, setShowResults] = useState(() => {
    const state = vscode.getState() as WebviewState;
    return state?.showResults !== false; // Default to true if not set
  });

  // Save state to VS Code whenever it changes
  useEffect(() => {
    vscode.setState({
      code,
      additionalContext,
      mode,
      apiResponse,
      isAutoMode,
      showResults
    });
  }, [code, additionalContext, mode, apiResponse, isAutoMode, showResults]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data.type === "selection") {
        // Just update the code, keep results visible unless auto mode triggers
        setCode(event.data.text);
        // Auto mode: automatically trigger find when new code is selected
        if (isAutoMode && event.data.text && event.data.text.trim() !== "First select code and press ALT + X to see the results.") {
          // Hide results only when auto mode is about to start
          setShowResults(false);
          showMessage("Auto mode: Analyzing selected code...", 'info');
          setTimeout(() => {
            handleFindClick();
          }, 500); // Small delay to allow UI to update
        }
      }
    };
    
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [isAutoMode, mode]); // Added mode as dependency

  async function handleFindClick() {
    if (!code.trim()) {
      showMessage("Please select some code first", 'error');
      return;
    }

    // Hide previous results when starting new search
    setShowResults(false);
    setIsLoading(true);
    
    try {
      const requestData = {
        code: code.trim(),
        details: additionalContext.trim(), // Include additional context in both modes
        categories: [],
        maxAlternatives: 3,
        mode: mode
      };

      console.log('Making API request via VS Code extension host');
      console.log('Request data:', requestData);
      console.log('Mode selected:', mode);
      
      // Use VS Code message passing to make the API call from the extension host
      // This bypasses webview CORS restrictions
      const response = await new Promise<any>((resolve, reject) => {
        const messageId = Date.now().toString();
        
        // Listen for the response
        const listener = (event: MessageEvent) => {
          if (event.data.type === 'apiResponse' && event.data.messageId === messageId) {
            window.removeEventListener('message', listener);
            if (event.data.error) {
              reject(new Error(event.data.error));
            } else {
              resolve({ data: event.data.data });
            }
          }
        };
        
        window.addEventListener('message', listener);
        
        // Send request to extension host
    vscode.postMessage({
          command: 'makeApiCall',
          messageId: messageId,
          url: 'https://expertline.xamples.xyz/api/compare',
          data: requestData
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('message', listener);
          reject(new Error('API request timeout'));
        }, 30000);
      });
      
      console.log('API Response:', response.data);
      console.log('API Response mode:', response.data?.mode);
      console.log('API Response comparisons count:', response.data?.comparisons?.length);
      
      // Validate response structure
      if (!response.data || !response.data.comparisons || !Array.isArray(response.data.comparisons)) {
        throw new Error('Invalid API response structure');
      }
      
      setApiResponse(response.data);
      setShowResults(true); // Show results when new data comes in
      
      // Show success message with mode and count information
      const modeText = response.data.mode === 'expert' ? 'Expert' : 'AI';
      const count = response.data.comparisons.length;
      const aiProvider = response.data.mode === 'ai' ? ' using Google Gemini' : '';
      showMessage(`${modeText} mode generated ${count} code alternative${count !== 1 ? 's' : ''}${aiProvider}`, 'info');
    } catch (err: any) {
      console.error('API Error Details:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      let errorMessage = 'Failed to fetch data from API';
      
      // Handle specific error types
      if (err.message?.includes('Cannot connect to Expertline API server')) {
        errorMessage = err.message;
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The API server may be slow to respond.';
      } else if (err.message?.includes('Invalid API response structure')) {
        errorMessage = 'Received invalid data from API server. Please try again.';
      } else if (err.message?.includes('API request timeout')) {
        errorMessage = 'Request timed out after 30 seconds. Please try again.';
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to Expertline API server. Please check your internet connection.';
      } else if (err.response) {
        errorMessage = `API Error: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'No response from API server. Check your network connection and server status.';
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred. Please check the console for details.';
      }
      
      // Show error using window.showInformationMessage
      showMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div>
      <header>
        <div className="header-content">
          <img src={logoSvg} alt="Expertline Logo" className="logo" />
          <h3 className="title">Expertline</h3>
        </div>
      </header>

      <main className="main-content">
        {apiResponse && showResults && (
          <div className="result-box-container">
            <div className="result-header">
              <h2 className="result-title">Findings ({apiResponse.mode} mode):</h2>
              <VSCodeButton 
                appearance="secondary"
                onClick={() => {
                  setShowResults(false);
                  // Scroll to input section
                  const inputSection = document.querySelector('.main-container');
                  if (inputSection) {
                    inputSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="back-to-input-btn"
              >
                New Input
              </VSCodeButton>
            </div>
            
            {apiResponse.message && (
              <div className="api-message">
                <p><strong>Note:</strong> {apiResponse.message}</p>
              </div>
            )}
            
            {apiResponse.comparisons.length > 0 ? (
              <div className="comparisons-table-container">
                <table className="result-comparison-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Summary</th>
                      <th>Code Example</th>
                      <th>Pros</th>
                      <th>Cons</th>
                      <th>Complexity</th>
                      <th>Reference Type</th>
                      {apiResponse.mode === 'expert' && <th>Endorsements</th>}
                      <th>Relevant Topics</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiResponse.comparisons.map((comparison, index) => (
                      <tr key={index}>
                        <td>
                          <div className="name-cell">
                            <strong>{comparison.name}</strong>
                            {comparison.isBaseline && (
                              <span className="baseline-badge">Baseline</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="summary-cell">
                            {comparison.summary}
                          </div>
                        </td>
                        <td>
                          <div className="code-cell">
                            <pre className="code-block">
                              <code>{comparison.codeBlock}</code>
                            </pre>
                          </div>
                        </td>
                        <td>
                          <ul className="pros-list">
                            {comparison.pros.map((pro, i) => (
                              <li key={i} className="pro-item">
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <ul className="cons-list">
                            {comparison.cons.map((con, i) => (
                              <li key={i} className="con-item">
                                {con}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <span className={`complexity-badge complexity-${comparison.complexity?.toLowerCase() || 'unknown'}`}>
                            {comparison.complexity || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="reference-type-badge">
                            {comparison.referenceType || 'N/A'}
                          </span>
                        </td>
                        {apiResponse.mode === 'expert' && (
                          <td>
                            <div className="endorsement-info">
                              {comparison.originalPost ? (
                                <>
                                  <div>Endorse: {comparison.originalPost.endorse || 0}</div>
                                  <div>Oppose: {comparison.originalPost.oppose || 0}</div>
                                  <div>Rate: {comparison.originalPost.endorseRate ? (comparison.originalPost.endorseRate * 100).toFixed(1) : '0.0'}%</div>
                                </>
                              ) : (
                                <div>No endorsement data</div>
                              )}
                            </div>
                          </td>
                        )}
                        <td>
                          <div className="topics-info">
                            {comparison.originalPost && comparison.originalPost.categories && comparison.originalPost.categories.length > 0 ? (
                              <div className="topics-list">
                                {comparison.originalPost.categories.slice(0, 3).map((topic, i) => (
                                  <span
                                    key={i}
                                    className="topic-tag"
                                    title={`Topic: ${topic}`}
                                  >
                                    {topic}
                                  </span>
                                ))}
                                {comparison.originalPost.categories.length > 3 && (
                                  <span className="more-topics">
                                    +{comparison.originalPost.categories.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="no-topics">No topics available</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {comparison.referenceLink && (
                              <VSCodeButton 
                                appearance="secondary"
                                onClick={() => {
                                  const url = comparison.referenceLink.startsWith('http') 
                                    ? comparison.referenceLink 
                                    : `https://expertline.xamples.xyz${comparison.referenceLink}`;
                                  vscode.postMessage({
                                    command: "openLink",
                                    url: url
                                  });
                                  showMessage("Opening reference link in browser...", 'info');
                                }}
                              >
                                View Reference
                              </VSCodeButton>
                            )}
                            <VSCodeButton 
                              appearance="secondary"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(comparison.codeBlock);
                                  showMessage("Code copied to clipboard!", 'info');
                                } catch (err) {
                                  console.error('Failed to copy to clipboard:', err);
                                  showMessage("Failed to copy to clipboard", 'error');
                                }
                              }}
                            >
                              Copy Code
                            </VSCodeButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No comparisons found for the selected code.</p>
            )}
          </div>
        )}

        <div className="main-container">
          <div className="input-section">
            <div className="code-box-wrapper">
              <label htmlFor="code-box">Selected Code:</label>
              <VSCodeTextArea 
                id="code-box" 
                value={code}
                onChange={(e) => setCode((e.target as HTMLTextAreaElement).value)}
                rows={8}
                resize="vertical"
                placeholder="Select code in the editor and press ALT + X"
              />
            </div>

            <div className="additional-context-wrapper">
              <label htmlFor="additional-context">Additional Context (Optional):</label>
              <VSCodeTextArea 
                id="additional-context" 
                value={additionalContext}
                onChange={(e) => setAdditionalContext((e.target as HTMLTextAreaElement).value)}
                rows={3}
                resize="vertical"
                placeholder="Add any additional context or requirements..."
              />
            </div>
          </div>

          <div className="controls-wrapper">
            <div className="controls-box">
              <div className="mode-dropdown">
                <label htmlFor="mode-selection">Select Mode:</label>
                <VSCodeDropdown 
                  id="mode-selection"
                  value={mode}
                  onChange={(e) => {
                    const newMode = (e.target as HTMLSelectElement).value;
                    setMode(newMode);
                    showMessage(`Switched to ${newMode === 'expert' ? 'Expert' : 'AI'} mode`, 'info');
                  }}
                >
                  <VSCodeOption value="expert">Expert Mode</VSCodeOption>
                  <VSCodeOption value="ai">AI Mode</VSCodeOption>
                </VSCodeDropdown>
              </div>

              <div className="auto-mode-wrapper">
                <div className="auto-mode-header">
                  <VSCodeCheckbox 
                    checked={isAutoMode}
                    onChange={(e) => {
                      const isChecked = (e.target as HTMLInputElement).checked;
                      setIsAutoMode(isChecked);
                      showMessage(`${isChecked ? 'Enabled' : 'Disabled'} Auto mode`, 'info');
                    }}
                  >
                    Auto Mode
                  </VSCodeCheckbox>
                  {isAutoMode && isLoading && (
                    <div className="loader-container">
                      <div className="spinner"></div>
                      <span className="loading-text">Auto-analyzing...</span>
                    </div>
                  )}
                </div>
                <p className="auto-mode-description">
                  {isAutoMode ? 
                    "Automatically analyzes code when selected. No manual input needed." : 
                    "Manual mode allows you to add context and manually trigger analysis."
                  }
                </p>
              </div>

              {!isAutoMode && (
                <div className="find-button-wrapper">
                  <VSCodeButton 
                    onClick={handleFindClick}
                    disabled={isLoading}
                    appearance="primary"
                  >
                    Find Alternatives
                  </VSCodeButton>
                  {isLoading && (
                    <div className="loader-container">
                      <div className="spinner"></div>
                      <span className="loading-text">Analyzing...</span>
                    </div>
                  )}
                </div>
              )}

              {apiResponse && !showResults && (
                <div className="show-results-wrapper">
                  <VSCodeButton 
                    onClick={() => setShowResults(true)}
                    appearance="secondary"
                  >
                    Show Last Results
                  </VSCodeButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="status-info">
              <span className={`mode-badge ${isAutoMode ? 'auto-mode' : 'manual-mode'}`}>
                {isAutoMode ? 'Auto Mode' : 'Manual Mode'}
              </span>
              <span className={`analysis-badge ${mode}-mode`}>
                {mode === 'expert' ? 'Expert Mode' : 'AI Mode'}
              </span>
              {isLoading && (
                <span className="loading-badge">
                  <div className="footer-spinner"></div>
                  Analyzing...
                </span>
              )}
            </div>
          </div>
          <div className="footer-right">
            <span className="footer-branding">
              Powered by Expertline
            </span>
          </div>
          </div>
      </footer>
    </div>
  )
}

export default App