import {
  Disposable,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
  Uri,
  CancellationToken,
  env
} from "vscode";
import * as https from 'https';
import * as http from 'http';
import { getUri, getNonce } from "../utilities";

export class FindTabPanel implements WebviewViewProvider {
  public static readonly viewType = "FindTabView";
  private _view: WebviewView | undefined;
  private _disposables: Disposable[] = [];

  constructor(private readonly extensionUri: Uri) { }

  /**
   * Called by VS Code when the view is created or revealed.
   */
  public resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    token: CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        Uri.joinPath(this.extensionUri, "out"),
        Uri.joinPath(this.extensionUri, "webview-ui/build")
      ]
    };

    webviewView.webview.html = this._getWebviewContent(
      webviewView.webview,
      this.extensionUri
    );

    // Enable state persistence
    webviewView.onDidChangeVisibility(() => {
      // Webview will retain context when hidden by default in newer VS Code versions
    });

    this._setWebviewMessageListener(webviewView.webview);
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.css"
    ]);
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.js"
    ]);
    
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src * http: https: ws: wss: data: blob: 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'; img-src data: https: http: blob:; font-src data: https: http:;">
          <link rel="stylesheet" href="${stylesUri}">
          <title>Expertline</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  public postSelection(text: string) {
    this._view?.webview.postMessage({
      type: "selection",
      text
    });
  }

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case "test":
            window.showInformationMessage(message.text);
            break;
          case "openLink":
            // Open external link in browser
            if (message.url) {
              env.openExternal(Uri.parse(message.url));
            }
            break;
          case "showInfo":
            window.showInformationMessage(message.text);
            break;
          case "showError":
            window.showErrorMessage(message.text);
            break;
          case "makeApiCall":
            // Handle API calls from webview
            this._makeApiCall(webview, message.messageId, message.url, message.data);
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  private async _makeApiCall(webview: Webview, messageId: string, url: string, data: any) {
    try {
      console.log('Extension host making API call to:', url);
      console.log('Request data:', data);
      console.log('Mode being sent:', data.mode);

      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const postData = JSON.stringify(data);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'VSCode-Expertline-Extension/1.0.0'
        }
      };

      const response = await new Promise<any>((resolve, reject) => {
        const req = httpModule.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(responseData);
              console.log('API Response received:', parsedData);
              resolve(parsedData);
            } catch (parseError) {
              console.error('Failed to parse API response:', parseError);
              reject(new Error('Invalid JSON response from API'));
            }
          });
        });

        req.on('error', (error) => {
          console.error('API request error:', error);
          reject(error);
        });

        req.setTimeout(30000, () => {
          req.destroy();
          reject(new Error('API request timeout'));
        });

        req.write(postData);
        req.end();
      });

      // Send successful response back to webview
      webview.postMessage({
        type: 'apiResponse',
        messageId: messageId,
        data: response
      });

    } catch (error: any) {
      console.error('Extension host API call failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred';
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to Expertline API server. Please check your internet connection.';
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The API server may be slow to respond.';
      } else if (error.message?.includes('Invalid JSON')) {
        errorMessage = 'Invalid response from API server.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Send error response back to webview
      webview.postMessage({
        type: 'apiResponse',
        messageId: messageId,
        error: errorMessage
      });
    }
  }

  public dispose() {
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }
}
