# WhereDaIp 0.5 (in development) 

*WhereDaIp is a SW created as a part of diploma thesis research on FIIT STU by student Bc. Maroš Čergeť in the academic year of 2021/2022.*

Add APIs of geolocation services to this software, add also providers of suspicious lists and other lists of added benefit (as TOR exit nodes, VPN servers list) and perform requests towards one or more IP addresses either via form or choose from a suspicious list you submitted. Look at graphs and maps to visually see what are the results of replies fused with other information.

--- 

**The added value of this software is that once you add the rules to this SW via REST API for requests on those sites, this delivers you the results for future requests in a costistent manner. Another added benefit is that, on those services you usually have some limited number of requests and that applies on to repeated requests. This SW stores requested IP adresses and returns locally stored data without spending requests on those services. It also benefits from additional lists and compares the results to them to show the user if the IP address is hidden in a way or was a part of attack. Visualizations are a final benefit**

--- 

Install instructions

`Download this repository`

`Install MongoDB Community`

`Install Node.js`

`Create .env file according to instructions in config/config-nonRestricted.js`

`npm install`

--- 

Run instructions

`npm run devStart`

`Open browser and enter "localhost:13000" (if you used the same port in config)`

--- 


> Features
- [X] Ability to add GeoDb services via REST API
- [ ] Test if: Are services good for paid services? 
- [X] Get info about actual GeoDb services in the db
- [X] Get info about actual IPs stored in the db
- [X] Fuse IPs in database into one bigger part
- [X] Ability to make request from WEB on one IP
- [X] Ability to make request from WEB on more IPs
- [X] Ability to receive replies
- [X] Ability to process a reply from JSON
- [X] Ability to process multiple replies
- [X] Ability to save data from replies
- [ ] Ability to make a request for an IP via REST API
- [ ] Be able to add providers of hidden IPs lists (TOR exit nodes, VPN serves)
- [ ] Be able to receive, process and save such list
- [ ] Be able to add providers of suspicious IPs lists
- [ ] Be able to receive, process and save list
- [ ] Fuse combined IPs geolocation outputs with additional lists
- [ ] Send suspicious IPs lists to geolocation
- [ ] Ignore IPs in the same /24 subnet during requests to save requests
- [ ] Implement limitations in order not to overuse free API plans
- [ ] Implement visualizations of actual state
- [ ] Create statistics in form of graphs
- [ ] Create statistics in form of Earth model


--- 

## Code explanation

/api: [dunno yet]

/config: environment variables and files init

/controllers: separated logic corresponding to routerss

/models: MongoDb data schemas

/rest-tests: files with specified REST requests to test application

/routes: routers that specifiy at which url should which controller respond

/services: supporting services for sending requests, help with logging and dates

/views: forms in ejs that show content to the visitor, prevents duplicity

app.js: specification of used engines, frameworks, view-engines, routes and listening ports

**.env: this file is supposed to be created via instructions in config file**



// note to myself:
git log --all --decorate --oneline --graph
http://examples.webglearth.com/#animation
