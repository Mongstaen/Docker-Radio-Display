# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js web application that provides a radio studio monitor display for mAirlist Radio Automation software. It shows the current song playing, microphone status, automation state, and includes a countdown timer with a visual clock display.

## Architecture

- **Backend**: Express.js server with Socket.IO for real-time updates
- **Frontend**: EJS templating with vanilla JavaScript and Socket.IO client
- **Data Persistence**: Simple JSON file storage (`src/lastUpdate.json`)
- **API Documentation**: Swagger UI with basic authentication
- **Integration**: Receives data from mAirlist via Pascal script (`mAirlist.mls`)

### Key Components

- `src/index.js` - Main Express server with Socket.IO, API endpoints, and Swagger integration
- `src/views/index.ejs` - Frontend template with real-time clock and status displays
- `src/swagger.js` - Swagger configuration for API documentation
- `src/public/style.css` - Styling for the display interface
- `mAirlist.mls` - Pascal script for mAirlist integration (configure URL and APPKEY)

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install dependencies
npm install
```

## Docker Commands

```bash
# Build Docker image
docker build -t radio-display .

# Run with Docker Compose (development)
docker-compose -f dev-compose.yml up

# Run with Docker Compose (production)
docker-compose -f compose.yml up
```

## Environment Variables

- `APPKEY` - API key for authentication (default: "yourappkey")
- `PORT` - Server port (default: 3000)
- `SWAGGER_USER` - Swagger UI username (default: "admin")
- `SWAGGER_PASSWORD` - Swagger UI password (default: "password")
- `DISPLAY_MICROPHONE` - Show microphone status (default: true)
- `DISPLAY_AUTOMATION` - Show automation status (default: true)
- `DISPLAY_EOF` - Show end-of-file countdown (default: true)
- `NODE_ENV` - Environment mode (affects logging verbosity)

## API Endpoints

- `GET /` - Main display interface
- `GET /lastUpdate` - Get current status data
- `POST /` - Update status (requires APPKEY authentication)
- `GET /swagger` - API documentation (requires basic auth)

## Data Flow

1. mAirlist sends updates via Pascal script to POST endpoint
2. Server validates APPKEY and updates JSON file
3. Socket.IO broadcasts changes to connected clients
4. Frontend updates display in real-time

## mAirlist Integration

Configure the Pascal script (`mAirlist.mls`) with your server URL and APPKEY, then add it to mAirlist's Background Scripts in the Control Panel.

## Testing

No automated tests are currently implemented. Manual testing involves:
1. Start the server
2. Open browser to localhost:3000
3. Send POST requests to test API endpoints
4. Verify real-time updates via Socket.IO