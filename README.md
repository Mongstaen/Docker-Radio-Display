## Radio Studio Monitor

This small app is intended for use on LAN, hence the low - to non existing - security features. Currently running on a Raspberry Pi in our local radio studio. All services hosted on the Raspberry Pi itself, running alongside mAirlist Radio Automation.

Some updates, added swagger endpoint protected by basic auth. Credentials can be set in the environment variables `SWAGGER_USER` and `SWAGGER_PASSWORD`. Default is `admin` and `password`.

## Features

- Show current song playing in mAirlist
- Show microphone state
- Show mAirlist automation state

## Maybe in the future

- Show current song playing in other software (e.g. Mixxx)
- Show current weather in your area?

## Installation

Start the container with the following command:

```
docker run -d \
 --name docker-radio-display \
 -p 3000:3000 \
 -e SWAGGER_USER=admin \
 -e SWAGGER_PASSWORD=password \
 ghcr.io/mongstaen/docker-radio-display:latest
```

### mAirlist configuration

Add mAirlist.mls to your mAirlist configuration folder, change the values in the const:

```pascal
const
  URL = 'your endpoint'; //eg. 'http://192.168.1.2:3000'
  APPKEY = 'yourappkey'; //eg. '1234567890abcdef'
```

Then go to mAirlist -> Control Panel -> Background Scripts and add the script to the list. Make sure to enable it.

## Contribute?

If you want to contribute, feel free to open an issue or a pull request. If you have any suggestions or ideas, please let me know.
Looking for someone to help maintaining this project.

## Video

[![Watch the video](https://img.youtube.com/vi/raYs-18zn80/maxresdefault.jpg)](https://www.youtube.com/watch?v=raYs-18zn80)

Buy me a coffee? :)
https://www.buymeacoffee.com/mongstad
