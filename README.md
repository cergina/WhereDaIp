# WhereDaIp 0.4 (in development) 

*WhereDaIp is a SW created as a part of diploma thesis research on FIIT STU by student Bc. Maroš Čergeť in the academic year of 2021/2022.*

This tool provides a way to request geolocation information about single IP or batch of IPs. These informations are coming from various places. In the first place, it's geolocation databases with their APIs. 

--- 

**The added value of this software is that once you add the rules to this SW via REST API for requests on those sites, this delivers you the results for future requests in a costistent manner. Another added benefit is that, on those services you usually have some limited number of requests and that applies on to repeated requests. This SW stores requested IP adresses and returns locally stored data without spending requests on those services**

--- 

Run instructions

`node run devStart`

--- 


> podporovane features
- [X] Ability to add GeoDb services via REST API
- [ ] Test if: Are services good for paid services? 
- [X] Get info about actual GeoDb services in the db
- [ ] Get info about actual IPs stored in the db
- [X] Ability to make request from GUI on one IP
- [X] Ability to make request from GUI on more IPs
- [X] Ability to receive reply
- [X] Ability to process reply from JSON
- [X] Ability to process reply from XML
- [] Ability to process data that does not have all fields in specified response data model
- [ ] Ability to save data from replies
- [ ] Ability to make a request for an IP via REST API


--- 

## Code explanation

/api: [dunno yet]

/config: environment variables and files init

/controllers: separated logic corresponding to routerss

/models: MongoDb data schemas

/rest-tests: files with specified REST requests to test application

/routes: routers that specifiy at which url should which controller respond

/services: [dunno yet]

/views: forms in ejs that show content to the visitor, not that important

app.js: specification of used engines, frameworks, view-engines, routes and listening ports

note to myself:
git log --all --decorate --oneline --graph
http://examples.webglearth.com/#animation
