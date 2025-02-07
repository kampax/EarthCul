//Code to download maps of soil hydrological groups from Soil Grids with pixel resolution of 250 meters
//Source: https://gee-community-catalog.org/projects/hihydro_soil/

/////////////////////////
// Select the park
/////////////////////////
// Aiguestortes
// Ordesa
// Peneda
// Guadarrama
// Picos
// SierraNieves
// SierraNevada
// Teide


var parque = "SierraNieves" ;
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.centerObject(AOI, 10);


// Select and filter the dataset
var hydrologic_soil_group = ee.Image('projects/sat-io/open-datasets/HiHydroSoilv2_0/Hydrologic_Soil_Group_250m')
                                              // The dual soil class groups are coded as 14 (A/D), 24 (B/D) and 34 (C/D)
                                              // Remapping them for visualization
                                              .remap([1, 14, 2, 24, 3, 34, 4], [1, 2, 3, 4, 5, 6, 7]); 

// visualization
var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.YlGnBu[7];

Map.addLayer(hydrologic_soil_group, {min:1, max:7, palette: palette}, 'Global Hydrologic Soil Groups');

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Clip   Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

hydrologic_soil_group = hydrologic_soil_group.clip(AOI);

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

var projection = hydrologic_soil_group.projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;

print(hydrologic_soil_group.projection().nominalScale());

Export.image.toDrive({
	image:hydrologic_soil_group,
	description:'hydrologic_soil_group',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 253.38411539957406,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});