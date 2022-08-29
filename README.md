## Radio Studio Monitor
This small app is intended for use on LAN, hence the low - to non existing - security features. Currently running on a Raspberry Pi in our local radio studio. All services hosted on the Raspberry Pi itself, running alongside mAirlist Radio Automation.

### Installation
* Clone this repository
* `cd Docker-Radio-Display`
* Create your .env file based on example in SRC. 
* `docker build --tag radio-monitor-docker .`
* `docker run -d -p 3000:3000 radio-monitor-docker`

![screenshot](https://github.com/Mongstaen/RadioStudioMonitor/blob/main/203078798_933184267461711_5805206543025988616_n.png?raw=true)

#
Buy me a coffee? :) 
https://www.buymeacoffee.com/mongstad