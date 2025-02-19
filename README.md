# Foodies - Food Ordering Progressive Web App

## Overview
Foodies is a modern Progressive Web Application (PWA) for ordering food from local restaurants. It provides a responsive, app-like experience with offline capabilities and installable features.

## Features
- Browse restaurants and menus
- Place food orders
- Responsive design for all devices
- Progressive Web App features:
  - Offline functionality
  - Installable on devices
  - Fast loading with service worker caching
- Email subscription for updates

## Installation
### Prerequisites
- PHP server environment
- Modern web browser

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/foodies.git
   ```
2. Navigate to the project directory:
   ```bash
   cd foodies/foodies
   ```
3. Start a local PHP server:
   ```bash
   php -S localhost:8000
   ```
4. Open the application in your browser:
   ```
   http://localhost:8000
   ```

## Usage
1. Open the application in your browser
2. Browse available restaurants and menus
3. Click "Order Now" to place an order
4. Subscribe to email updates using the form

## Technical Details
### File Structure
```
foodies/
├── assets/            # Images and SVGs
├── app.html            # Main application HTML
├── index.php           # Entry point
├── style.css           # Main stylesheet
├── index.js            # Main JavaScript
├── sw.js               # Service Worker
├── db.php              # Database operations
├── order.php           # Order processing
├── manifest.json       # PWA manifest
```

### PWA Features
A Progressive Web App (PWA) is a web application that uses modern web capabilities to deliver an app-like experience to users. PWAs combine the best of web and mobile apps, offering features like:

- **Reliability**: Load instantly, even in uncertain network conditions
- **Fast**: Respond quickly to user interactions
- **Engaging**: Feel like a natural app on the device, with an immersive user experience

Foodies implements the following PWA features:

- Service Worker caching for offline access
- Web App Manifest for installability
- Cache-first strategy for static assets
- Network-first strategy for dynamic content

## Development
### Requirements
- PHP 7.0+
- Modern web browser
- Code editor

### Running Locally
1. Start PHP server:
   ```bash
   php -S localhost:8000
   ```
2. Open in browser:
   ```
   http://localhost:8000
   ```

### Testing PWA Features
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Test:
   - Service Worker registration
   - Cache storage
   - Manifest validation
   - Offline functionality

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
MIT License - See LICENSE file for details
