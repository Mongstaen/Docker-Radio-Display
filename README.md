## Radio Studio Monitor

This Node.js web application provides a real-time radio studio monitor for mAirlist Radio Automation software. Designed for LAN use with minimal security features, it's perfect for radio studio environments where you need to display current song information and studio status.

## Features

- **Real-time display**: Shows current song (artist/title) playing in mAirlist
- **Studio status indicators**:
  - Microphone state (on/off)
  - Automation mode (Auto/Assist)
  - End of file countdown with visual indicator
- **Visual clock**: Analog-style clock with seconds display and countdown dots
- **Swagger API documentation**: Protected endpoint for API testing and documentation
- **Configurable display**: Toggle visibility of microphone, automation, and EOF indicators
- **Data persistence**: Maintains last known state between restarts
- **Docker support**: Easy deployment with Docker and Docker Compose

## Environment Configuration

All display elements can be configured via environment variables:

- `APPKEY` - API authentication key (default: "yourappkey")
- `PORT` - Server port (default: 3000)
- `SWAGGER_USER` - Swagger UI username (default: "admin")
- `SWAGGER_PASSWORD` - Swagger UI password (default: "password")
- `DISPLAY_MICROPHONE` - Show microphone status (default: true)
- `DISPLAY_AUTOMATION` - Show automation status (default: true)
- `DISPLAY_EOF` - Show end-of-file countdown (default: true)
- `NODE_ENV` - Environment mode (affects logging verbosity)

## Installation

### Quick Start with Docker

```bash
docker run -d \
  --name docker-radio-display \
  -p 3000:3000 \
  -e APPKEY=yourappkey \
  -e SWAGGER_USER=admin \
  -e SWAGGER_PASSWORD=password \
  ghcr.io/mongstaen/docker-radio-display:latest
```

### Docker Compose (Recommended)

For development:

```bash
docker-compose -f dev-compose.yml up
```

For production:

```bash
docker-compose -f compose.yml up
```

### Local Development

```bash
# Navigate to src directory
cd src

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

The application will be available at `http://localhost:3000`

## mAirlist Integration

### Setup Steps

1. **Configure the Pascal Script**: Edit `mAirlist.mls` and update the constants:

   ```pascal
   const
     URL = 'your endpoint'; //eg. 'http://192.168.1.2:3000'
     APPKEY = 'yourappkey'; //eg. '1234567890abcdef'
   ```

2. **Install in mAirlist**:

   - Copy `mAirlist.mls` to your mAirlist configuration folder
   - Go to mAirlist → Control Panel → Background Scripts
   - Add the script to the list and enable it

3. **Verify Integration**: The script will automatically send updates to your display when:
   - A new song starts playing
   - Microphone state changes
   - Automation mode switches
   - End of file events occur

### API Endpoints

- `GET /` - Main display interface
- `GET /lastUpdate` - Get current status data (JSON)
- `POST /` - Update status (requires APPKEY authentication)
- `GET /swagger` - API documentation (requires basic auth)

## Development

### Project Structure

```
src/
├── index.js          # Main Express server with Socket.IO
├── swagger.js        # Swagger API documentation config
├── views/
│   └── index.ejs     # Frontend template
├── public/
│   ├── style.css     # Styling
│   └── Seven Segment.ttf  # Custom font
└── package.json      # Dependencies and scripts
```

### Contributing

If you want to contribute, feel free to open an issue or a pull request. If you have any suggestions or ideas, please let me know.
Looking for someone to help maintaining this project.

### Future Ideas

- Support for other radio automation software (e.g. Mixxx)
- Weather display integration
- Enhanced visual themes
- Mobile-responsive design

## Video

[![Watch the video](https://img.youtube.com/vi/raYs-18zn80/maxresdefault.jpg)](https://www.youtube.com/watch?v=raYs-18zn80)

Buy me a coffee? :)
https://www.buymeacoffee.com/mongstad
