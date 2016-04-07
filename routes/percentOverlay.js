var express = require('express');
var router = express.Router();
var gdal = require("gdal");

router.post('/', function(req, res, next) {
    console.log('request: ',req.body)

    var input = gdal.open(JSON.stringify(req.body.features[0].geometry))
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
            })
        });
    })
    
    //close datasets
    input.close();
    region.close();
    
    //send output
    res.json(output)    
});

module.exports = router;