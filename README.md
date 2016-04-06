# node-percentOverlay

* proof of concept for calculating percent overlayers from input geojson against a filegdb set of regional polygons
* all node-gdal based

```
sudo apt-get install npm nodejs-legacy
npm install -g npm forever
sudo npm install npm -g
```

clone repo
```
git clone https://github.com/marsmith/node-zonalstats.git
cd node-zonalstats
npm install
```

to start:
```
npm start
```

OR to start as background process:
```
forever start ./bin/www
```
