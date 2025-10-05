# Expertline VS Code Extension

<div align="center">

**F1 for coders, Use the C1 in your projects.**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)](https://code.visualstudio.com/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![Expertline Platform](https://img.shields.io/badge/Platform-Expertline-orange?logo=web)](https://expertline.xamples.xyz/)
[![Website](https://img.shields.io/badge/Website-Expertline-green)](https://expertline.xamples.xyz/)

*Find the best code options recommended by industry experts and documentation*

</div>

## Overview

Expertline is a powerful VS Code extension that integrates with the [Expertline platform](https://expertline.xamples.xyz/) to help developers find the most optimized code solutions. This extension provides expert recommendations and AI-powered alternatives by analyzing your selected code and presenting comprehensive comparisons with pros, cons, complexity ratings, and community endorsements.

### Expertline Platform
Visit the main [Expertline website](https://expertline.xamples.xyz/) to:
- **Explore Topics**: Browse expert-curated coding topics and best practices
- **View Posts**: Access detailed posts with community endorsements
- **Discover Solutions**: Find optimized approaches for your specific use cases
- **Join Community**: Connect with industry experts and fellow developers

## Key Features

### Dual Analysis Modes
- **Expert Mode**: Community-vetted solutions with endorsements and author information
- **AI Mode**: AI-generated alternatives using Google Gemini with contextual analysis

### Comprehensive Comparisons
- **Detailed Analysis**: Pros, cons, complexity ratings, and code examples
- **Community Insights**: Endorsement counts, opposition rates, and author credibility
- **Relevant Topics**: Tagged topics for easy categorization and discovery
- **Reference Links**: Direct access to original posts and documentation

### Modern UI/UX
- **Responsive Design**: Optimized for all screen sizes
- **VS Code Integration**: Native UI components with consistent theming
- **Interactive Elements**: Clickable topic tags and reference links
- **Real-time Feedback**: Status messages and progress indicators

### Smart Automation
- **Auto Mode**: Automatically analyzes code when selected
- **Manual Mode**: Full control over analysis timing and context
- **Keyboard Shortcuts**: Quick access with `Alt+X`
- **Context Menu**: Right-click integration for seamless workflow

## Installation

### Prerequisites
- **VS Code**: Version 1.104.0 or higher
- **Node.js**: Version 16.0.0 or higher
- **Internet Connection**: Required for API access

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/alichohan1999/expertline-vscode-extension.git
   cd expertline-vscode-extension
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Build the Extension**
   ```bash
   # Build the React webview UI
   npm run build:webview
   
   # Compile the TypeScript extension
   npm run compile
   ```

4. **Run in Development Mode**
   ```bash
   # Press F5 in VS Code to launch Extension Development Host
   ```

### Production Installation
*(Coming soon - VS Code Marketplace)*

## How to Use

### Quick Start
1. **Select Code**: Highlight any code snippet in your VS Code editor
2. **Activate Extension**: Press `Alt+X` or right-click → "Find Expertline"
3. **Choose Mode**: Select Expert Mode or AI Mode
4. **Add Context** *(Optional)*: Provide additional requirements or context
5. **Analyze**: Click "Find Alternatives" or enable Auto Mode
6. **Review Results**: Browse the comprehensive comparison table

### Mode Comparison

| Feature | Expert Mode | AI Mode |
|---------|-------------|---------|
| **Source** | Community Experts | Google Gemini AI |
| **Endorsements** | Community Votes | Not Available |
| **Author Info** | Username & Categories | Not Available |
| **Speed** | Fast | Moderate |
| **Accuracy** | High (Human Vetted) | High (AI Powered) |

### Auto Mode
Enable Auto Mode for automatic analysis when you select new code:
- **Instant Analysis**: No manual trigger needed
- **Smart Detection**: Ignores placeholder text
- **Seamless Integration**: Works with your normal coding workflow

## API Integration

The extension communicates with the [Expertline platform API](https://expertline.xamples.xyz/) at `https://expertline.xamples.xyz/api/compare`:

### Request Format
```json
{
  "code": "selected code snippet",
  "details": "additional context",
  "categories": [],
  "maxAlternatives": 3,
  "mode": "expert"
}
```

### Response Structure
```json
{
  "mode": "expert",
  "comparisons": [
    {
      "name": "Solution Name",
      "summary": "Brief description",
      "pros": ["advantage1", "advantage2"],
      "cons": ["disadvantage1", "disadvantage2"],
      "complexity": "low|medium|high",
      "codeBlock": "implementation code",
      "referenceLink": "/posts/post-id",
      "referenceType": "post",
      "isBaseline": true,
      "originalPost": {
        "username": "author",
        "categories": ["topic1", "topic2"],
        "endorse": 20,
        "oppose": 1,
        "endorseRate": 0.95
      }
    }
  ]
}
```

## Project Structure

```
expertline-vscode-extension/
├── expertline/
│   ├── src/                    # Extension source code
│   │   ├── extension.ts        # Main extension entry point
│   │   └── panels/            # Webview panel implementations
│   │       ├── findTab.ts     # Main panel logic
│   │       └── index.ts       # Panel exports
│   ├── webview-ui/            # React webview application
│   │   ├── src/
│   │   │   ├── App.tsx        # Main React component
│   │   │   ├── App.css        # Styling and theming
│   │   │   ├── assets/        # Images and icons
│   │   │   └── utilities/     # Helper functions
│   │   │       └── vscode.ts  # VS Code API wrapper
│   │   └── build/             # Built webview assets
│   ├── out/                   # Compiled extension code
│   ├── package.json           # Extension manifest
│   └── tsconfig.json          # TypeScript configuration
├── README.md                  # This file
└── LICENSE                    # GPL-3.0 license
```

## Development

### Available Scripts

```bash
# Install all dependencies (extension + webview)
npm run install:all

# Build React webview UI
npm run build:webview

# Compile TypeScript extension
npm run compile

# Watch mode for development
npm run watch

# Package extension for distribution
npm run package
```

### Building for Production

1. **Build the Webview**
   ```bash
   cd webview-ui
   npm run build
   cd ..
   ```

2. **Compile the Extension**
   ```bash
   npm run compile
   ```

3. **Package the Extension**
   ```bash
   npm run package
   ```

### Debugging

1. **Set Breakpoints**: Use VS Code's built-in debugger
2. **Console Logs**: Check the Extension Development Host console
3. **Webview DevTools**: Use browser dev tools for webview debugging

## Customization

### Themes
The extension automatically adapts to your VS Code theme:
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for extended use
- **High Contrast**: Accessibility-friendly options

### Settings
Configure the extension behavior through VS Code settings:
```json
{
  "expertline.autoMode": false,
  "expertline.defaultMode": "expert",
  "expertline.maxAlternatives": 3
}
```

## Troubleshooting

### Common Issues

**Extension not responding**
- Ensure internet connection is active
- Check if Expertline API is accessible
- Restart VS Code and try again

**Auto Mode not working**
- Verify code selection is valid (not placeholder text)
- Check if Auto Mode is enabled in the UI
- Try manual mode as fallback

**API errors**
- Confirm network connectivity
- Check VS Code Developer Console for detailed errors
- Verify API endpoint is accessible

**Clipboard issues**
- Some environments may restrict clipboard access
- Use the copy button in the table instead of keyboard shortcuts

### Getting Help

1. **Check the Console**: Open VS Code Developer Tools for detailed error messages
2. **Verify Network**: Ensure `https://expertline.xamples.xyz` is accessible
3. **Report Issues**: Create an issue on GitHub with error details

## Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Areas for Contribution
- **UI/UX Improvements**: Better design and user experience
- **Performance**: Faster API calls and rendering
- **Features**: New analysis modes and capabilities
- **Documentation**: Better guides and examples
- **Testing**: Unit tests and integration tests

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Expertline Team**: For providing the powerful API and platform
- **VS Code Team**: For the excellent extension development framework
- **React Community**: For the robust webview UI framework
- **Contributors**: Thanks to all who help improve this extension

## Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/alichohan1999/expertline-vscode-extension/issues)
- **Expertline Platform**: [https://expertline.xamples.xyz](https://expertline.xamples.xyz) - Main website for topics, posts, and community
- **Documentation**: Check this README and inline code comments
- **Community**: Join discussions on the [Expertline platform](https://expertline.xamples.xyz/)

## Roadmap

### Upcoming Features
- [ ] **VS Code Marketplace**: Official extension distribution
- [ ] **Offline Mode**: Cached analysis for common patterns
- [ ] **Custom Providers**: Support for additional AI providers
- [ ] **Team Collaboration**: Share and discuss code alternatives
- [ ] **Performance Metrics**: Analysis speed and accuracy tracking
- [ ] **Integration APIs**: Connect with other development tools

### Version History

#### v0.0.1 (Current)
- Initial release with Expert and AI modes
- Comprehensive comparison tables
- Auto and manual analysis modes
- VS Code native UI integration
- Responsive design and modern styling
- Real-time status messages and feedback

---

<div align="center">

**Made with love for the developer community**

[Star this repository](https://github.com/alichohan1999/expertline-vscode-extension) | [Visit Expertline Platform](https://expertline.xamples.xyz/) | [Report Issues](https://github.com/alichohan1999/expertline-vscode-extension/issues) | [Request Features](https://github.com/alichohan1999/expertline-vscode-extension/issues)

</div>