var express = require('express');
var router = express.Router();
var gdal = require("gdal");

router.post('/', function(req, res, next) {
   
    console.log('before mem usage(mb): ',process.memoryUsage().rss / 1048576);

    var input = gdal.open(JSON.stringify(req.body.geometry))
    var inputLayer = input.layers.get(0);
    console.log('\nInput Driver: ' + input.driver.description);
    
    var regionSource = "input/SS_regionPolys.gdb"
    var region = gdal.open(regionSource);   
    console.log('Region driver: ' + region.driver.description);
    var output = [];
    
    region.layers.forEach(function(layer, i) {

        var regionLayer = layer;
        console.log('checking region: ', regionLayer.name);

        regionLayer.features.forEach(function(regionFeature, i) { 
            var regionGeom = regionFeature.getGeometry();
            name = regionFeature.fields.get("Name")
            gridcode = regionFeature.fields.get("GRIDCODE")
            
            inputLayer.features.forEach(function(inputFeature, i) {
                var inputGeom = inputFeature.getGeometry();
                
                //project input geometry
                inputGeom.transformTo(regionLayer.srs);
                
                if (inputGeom.intersects(regionGeom)) {
                    console.log('Found an intersection: ', name)
                    
                    var intersection = inputGeom.intersection(regionGeom)
                    var intersectArea = intersection.getArea();
                    var totalArea = inputGeom.getArea();
                    console.log('[intersectArea,totalArea]: ', intersectArea,totalArea)
                    output.push({"name":name,"code":gridcode,"percent":(intersectArea/totalArea)*100})
                }
                inputGeom = null;
            })
            
            regionGeom = null;
        });
    })
    
    //close datasets
    input.close();
    region.close();
    inputLayer = null;
    regionLayer = null;
    regionGeom = null;
    inputGeom = null;

    if (global.gc) {
        global.gc();
    } 
    else {
        console.log('Garbage collection unavailable.  Pass --expose-gc '
        + 'when launching node to enable forced garbage collection.');
    }
    
    console.log('after mem usage(mb): ',process.memoryUsage().rss / 1048576);
    
    //send output
    res.json(output)    
});

module.exports = router;
