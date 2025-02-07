// Code for calculate the index of Ecosystem Services provision (ESPI)

// Article
//https://www.researchgate.net/publication/305650523_An_integrative_index_of_Ecosystem_Services_provision_based_on_remotely_sensed_data

// Related
//https://www.sciencedirect.com/science/article/pii/S1470160X21005203
//https://www.futurewater.nl/wp-content/uploads/2021/01/20210919_InleLake_ES_final_report_v2.pdf


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// Variable to select the index
var indice = 'NDVI'; // 'NDVI','LSWI', 'EVI', 'NDWI', 'NDSI',

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
var parque = "SierraNevada" ;
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.centerObject(AOI, 18);
Map.addLayer(AOI, {}, "Parque_"+parque, 0);
Map.setOptions('TERRAIN');


//////////////////////////////////////////////////////////////////////
//// Filters//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// Select Dates
var inicio = "2018-01-01";
var fin = "2022-12-31";
// Filter months
var months=ee.Filter.calendarRange(1, 12, "month");
//Cloud filter based on Cloud_cover of the whole scene
var cloudcover= 40;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////TEMPORAL SERIES OF SENTINEL/////////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BASED ON: https://developers.google.com/earth-engine/tutorials/community/sentinel-2-s2cloudless


var START_DATE = inicio;
var END_DATE = fin;
var CLOUD_FILTER = 60;
var CLD_PRB_THRESH = 40;
var NIR_DRK_THRESH = 0.15;
var CLD_PRJ_DIST = 2;
var BUFFER = 10;


var get_s2_sr_cld_col = function(aoi, start_date, end_date) {
    // Import and filter S2 SR.
    var s2_sr_col = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(aoi)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', CLOUD_FILTER)));

    // Import and filter s2cloudless.
    var s2_cloudless_col = (ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
        .filterBounds(aoi)
        .filterDate(start_date, end_date));

    // Join the filtered s2cloudless collection to the SR collection by the 'system:index' property.
    return ee.ImageCollection(ee.Join.saveFirst('s2cloudless').apply({
        'primary': s2_sr_col,
        'secondary': s2_cloudless_col,
        'condition': ee.Filter.equals({
            'leftField': 'system:index',
            'rightField': 'system:index'
        })
    }));
};

var add_cloud_bands = function(img) {
  // Get s2cloudless image, subset the probability band.
  var cld_prb = ee.Image(img.get('s2cloudless')).select('probability');
  
  // Condition s2cloudless by the probability threshold value.
  var is_cloud = cld_prb.gt(CLD_PRB_THRESH).rename('clouds');
  
  // Add the cloud probability layer and cloud mask as image bands.
  return img.addBands(ee.Image([cld_prb, is_cloud]));
};


var add_shadow_bands = function(img) {
    // Identify water pixels from the SCL band.
    var not_water = img.select('SCL').neq(6)

    // Identify dark NIR pixels that are not water (potential cloud shadow pixels).
    var SR_BAND_SCALE = 1e4
    var dark_pixels = img.select('B8').lt(NIR_DRK_THRESH*SR_BAND_SCALE).multiply(not_water).rename('dark_pixels')

    // Determine the direction to project cloud shadow from clouds (assumes UTM projection).
    var shadow_azimuth = ee.Number(90).subtract(ee.Number(img.get('MEAN_SOLAR_AZIMUTH_ANGLE')));

    // Project shadows from clouds for the distance specified by the CLD_PRJ_DIST input.
    var cld_proj = (img.select('clouds').directionalDistanceTransform(shadow_azimuth, CLD_PRJ_DIST*10)
        .reproject({'crs': img.select(0).projection(), 'scale': 100})
        .select('distance')
        .mask()
        .rename('cloud_transform'))

    // Identify the intersection of dark pixels with cloud shadow projection.
    var shadows = cld_proj.multiply(dark_pixels).rename('shadows');

    // Add dark pixels, cloud projection, and identified shadows as image bands.
    return img.addBands(ee.Image([dark_pixels, cld_proj, shadows]));
};


var add_cld_shdw_mask = function(img){
    // Add cloud component bands.
    var img_cloud = add_cloud_bands(img);

    // Add cloud shadow component bands.
    var img_cloud_shadow = add_shadow_bands(img_cloud);

    // Combine cloud and shadow mask, set cloud and shadow as value 1, else 0.
    var is_cld_shdw = img_cloud_shadow.select('clouds').add(img_cloud_shadow.select('shadows')).gt(0);

    // Remove small cloud-shadow patches and dilate remaining pixels by BUFFER input.
    // 20 m scale is for speed, and assumes clouds don't require 10 m precision.
    is_cld_shdw = (is_cld_shdw.focalMin(2).focalMax(BUFFER*2/20)
        .reproject({'crs': img.select([0]).projection(), 'scale': 20})
        .rename('cloudmask'));

    // Add the final cloud-shadow mask to the image.
    return img_cloud_shadow.addBands(is_cld_shdw);
};


var apply_cld_shdw_mask = function(img) {
    // Subset the cloudmask band and invert it so clouds/shadow are 0, else 1.
    var not_cld_shdw = img.select('cloudmask').not();
    
    // Apply scaling factor to AOT and WVP data
    var aot_wvp = img.select(['AOT', 'WVP']).multiply(0.001);

    //  Subset reflectance bands and update their masks, apply scale add AOT, WVP and SLC and return the result.
    return img.select('B.*').updateMask(not_cld_shdw).multiply(0.0001).addBands(aot_wvp).addBands(img.select(['SCL']));
}; 

var s2_sr_cld_col_eval = get_s2_sr_cld_col(AOI, START_DATE, END_DATE);
var s2_sr_cld_col_eval_disp = s2_sr_cld_col_eval.map(add_cld_shdw_mask);

var img = s2_sr_cld_col_eval_disp.first();

// Subset layers and prepare them for display.
var clouds = img.select('clouds').selfMask();
var shadows = img.select('shadows').selfMask();
var dark_pixels = img.select('dark_pixels').selfMask();
var probability = img.select('probability');
var cloudmask = img.select('cloudmask').selfMask();
var cloud_transform = img.select('cloud_transform');

var img_masked = apply_cld_shdw_mask(img);

print(s2_sr_cld_col_eval_disp);

//-----------------------------------------------------------------------------------------------------------------------------
/////////////////////////////// rename the bands ///////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------

// Select bands for the calculations of the indices
var col_S2 = s2_sr_cld_col_eval_disp.select(['B2','B3','B4','B5', 'B6','B7', 'B8', 'B11','B12']);


//Rename bands
var S2_rename = function(image) {
  return  image.select(['B2','B3','B4','B5', 'B6','B7', 'B8', 'B11','B12'],['Blue', 'Green','Red' ,'RedEdge1','RedEdge2', 'RedEdge3', 'NIR','SWIR1', 'SWIR2'])};            

//// apply function
var Col_S2 = col_S2.map(S2_rename);



//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// FILTER//////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

col_sentinel = Col_S2.filterDate(inicio, fin); 
print(col_sentinel.size());

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// INDICES   //////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

// Function for calculating NDWI

var addNDWI = function(image) {
  var NDWI = image.normalizedDifference(['Green','NIR']).rename('NDWI');
  return image
    .addBands(NDWI)
    .copyProperties(image, ['system:time_start']);
};


// Function for calculating EVI
var addEVI=function(image){
var EVI = image.expression(
      '2.5 * ((NIR - RED) / (NIR + (6 * RED) - (7.5 * BLUE) + 1))', {
      'NIR' : image.select('NIR'),
      'RED' : image.select('Red'),
      'BLUE': image.select('Blue')}).rename('EVI');
      return image.addBands(EVI)
      .copyProperties(image, ['system:time_start']);
};

// Function for calculating NDVI
var addNDVI = function(image) {
  var NDVI = image.normalizedDifference(['NIR','Red']).rename('NDVI');
  return image
    .addBands(NDVI)
    .copyProperties(image, ['system:time_start']);
};

// Function for calculating LSWI
var addLSWI = function(image) {
  var LSWI = image.normalizedDifference(['NIR','SWIR1']).rename('LSWI');/// CAMBIA SWIR 
  return image
    .addBands(LSWI)
    .copyProperties(image, ['system:time_start']);
};

// Function for calculating NDSI
var addNDSI = function(image) {
  var NDSI = image.normalizedDifference(['Green','SWIR1']).rename('NDSI');
  return image
    .addBands(NDSI)
    .copyProperties(image, ['system:time_start']);
};


// Function for calculating NBR
var addNBR = function(image) {
  var NBR = image.normalizedDifference(['NIR','SWIR2']).rename('NBR');
  return image
    .addBands(NBR)
    .copyProperties(image, ['system:time_start']);
};

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// APPLY FUNCTIONS//////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

// Aplicar la función correspondiente a la colección Sentinel
var col_sentinel;
if (indice === 'NDVI') {
  col_sentinel = col_sentinel.map(addNDVI);
} else if (indice === 'LSWI') {
  col_sentinel = col_sentinel.map(addLSWI);
} else if (indice === 'EVI') {
  col_sentinel = col_sentinel.map(addEVI);
} else if (indice === 'NDWI') {
  col_sentinel = col_sentinel.map(addNDWI);
} else if (indice === 'NDSI') {
  col_sentinel = col_sentinel.map(addNDSI);
} else if (indice === 'NBR') {
  col_sentinel = col_sentinel.map(addNBR);
} else {
  print("Invalid index. Select between 'NDVI', 'LSWI', 'EVI', 'NDWI', 'NDSI', 'NBR'");
}

// Select only the index
var Col = col_sentinel.select(indice);

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Summary//////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

var collection = Col;


////ESPI = NDVI mean * (1-NDVIcv)
// Defines the function to calculate ESPI
var calculateESPI = function(collection) {
  // Calculate the mean, median, standard deviation, minimum and maximum
  var meanImage = collection.mean().toFloat();
  var stdDevImage = collection.reduce(ee.Reducer.stdDev()).toFloat();
  //Calculate the coefficient of variation
  var cvImage = stdDevImage.divide(meanImage);
  // Calculate ESPI
  var ESPI = meanImage.multiply(ee.Image.constant(1).subtract(cvImage));
  return ESPI;
};

// Defines the range of years of interest
var years = ee.List.sequence(2018, 2022);

// Iterate over the years and calculate the ESPI for each year
var ESPI_byYear = years.map(function(year) {
  // Filter the collection to include only images corresponding to each year
  var collection_year = collection.filter(ee.Filter.calendarRange(year, year, 'year'));
  
  // Calculate ESPI for the current year
  var ESPI_year = calculateESPI(collection_year);
  
  return ESPI_year.rename('ESPI');
});

// Convert image list to image collection
ESPI_byYear = ee.ImageCollection.fromImages(ESPI_byYear);
print('ESPI_byYear:',ESPI_byYear);

//// Calculate an ESPI average for all period

var ESPI = ESPI_byYear.mean(); 

print(ESPI);
// View the resulting image
var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.RdYlGn[7];

Map.addLayer(ESPI, {min:-0.5, max:0.5, palette: palette
}, 'ESPI index');

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

var projection = s2_sr_cld_col_eval_disp.first().select('B2').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;


Export.image.toDrive({
	image:ESPI,
	description:'ESPI_'+indice,
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 10,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});