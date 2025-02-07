// This code computes the Ecosystem Functional Attributes (EFAs) of a period.
// EFAs are Annual Mean, SD, Max, Min, Date of Max, Date of Min; see Alcaraz-Segura et al. 2009. Environmental Management.
// Authors: Domingo Alcaraz-Segura, Javier Blanco, Camilo Bagnato
// Dept. of Botany, University of Granada (Spain) 
// Contact: e-mail: dalcaraz@ugr.es
// Version: 3p4 2020_11_24

var indice = 'LST'; //  'NDVI','LSWI', 'EVI', 'NDWI', 'NDSI', 'NBR', 'albedo'

/////////////////////////
// Select the park
/////////////////////////

//Aiguestortes
// Ordesa
// Peneda
// Guadarrama
// Picos
// SierraNieves
// SierraNevada
// Teide
var parque = "Teide" ;
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
var startDate = "2018-01-01";//"2015-01-01" "2014-01-01"
var endDate = "2022-12-31";//"2022-12-31" "2018-12-31"
var monthsFilter = ee.Filter.calendarRange(1, 12, 'month'); // Ejemplo de filtro de meses
var maxCloudCover = 100; // Ejemplo de cobertura máxima de nubes

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// import module
var IndicesModule = require('users/cnav/EarthCul:EFAs/Indices.js');


// //Landsat
// var landsatModule = require('users/cnav/EarthCul:EFAs/Landsat.js');
var landsatModule = require('users/cnav/EarthCul:EFAs/LandsatCollection.js');

// var landsat8Collection = landsatModule.getLandsatCollection(startDate, endDate, AOI, monthsFilter, maxCloudCover);
// var Col = landsat8Collection.map(IndicesModule.addNDVI).select(indice);
// Define la función para recortar una imagen
var clip = function(imagen) {
  return imagen.clip(AOI);
};
// print(Col)
// import module
// var sentinelModule = require('users/cnav/EarthCul:EFAs/Sentinel.js');
// var sentinel2Collection = sentinelModule.getSentinel2Collection(startDate, endDate, AOI, monthsFilter, maxCloudCover)
// .map(sentinelModule.add_cld_shdw_mask)// Filtros de nubes 
// .map(sentinelModule.apply_cld_shdw_mask)
// .map(clip);

// var Col = sentinel2Collection.map(IndicesModule.addAlbedoS2).select(indice);
// var test = Col.median();
// Map.addLayer(test, {}, "test")

Map.centerObject(AOI);

// FOR LST
var indice = 'LST';
var LSTModule = require('users/cnav/EarthCul:EFAs/LST.js');
var LST_Collection = LSTModule.getLSTCollection(startDate, endDate, AOI, monthsFilter, maxCloudCover);
var Col = LST_Collection.map(clip);
print(Col);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// 1) SETTING VARIABLES FOR ANALYSIS (Modify only these sections) ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//añadir gpp y npp 500m
//añadir cuantificador de valores perdidos por año y por periodo de Rohaifa Khaldi

// 1.4) Study area  // Be CAREFUL the whole world must be visualized before exportation of a particular region!!!!!!                  
Map.centerObject(AOI, 10); // Center on the Globe.

var UseRegion = 1; // Set to 0 to compute the Globe
if (UseRegion == 1){
  // See https://developers.google.com/earth-engine/importing
  //https://developers.google.com/earth-engine/importing#upload-a-shapefile for more information about hot to create and importe Feature Collections
//var shape = ee.FeatureCollection('ft:1Pt6bVCDgLYeYb09a4MFsaVVzgXAbCM1k-PAMQzRf');// Europe
//var shape = ee.FeatureCollection('ft:1wMSD6_m50avWmqZyYPLLI48tNNPjOHaaYCNacjTQ');// ip?
//var shape = ee.FeatureCollection('users/dalcaraz/shared/shapesMar2018/NWIP10kmbuffer');//
//var shape = ee.FeatureCollection('users/dalcaraz/shared/Arctic/StudyAreaArcticGeo_WGS84_SinglePartWithCut180Deg');// WoodyTurner&Elisa
//var shape = ee.FeatureCollection('users/dalcaraz/shared/Carbono/gadm36_ECU_0');//
//var shape = ee.FeatureCollection('users/dalcaraz/shared/Carbono/ContinentalSpain');// Continental Spain Cecilio
var shape = AOI;

// Square around Andalusia
var polygon = /* color: #d6300 */ ee.Geometry.Polygon(
[[[-7.60,39.00],
[-7.60,35.84],
[-1.47,35.84],
[-1.47,39.00]
]]);
// Square around Iberian Peninsula
var polygon = /* color: #d6300 */ ee.Geometry.Polygon(
[[[-10.0,43.8],
[-10.0,35.8],
[4.5,35.8],
[4.5,43.8]
]]);
// Square around Canary Islands
var polygon = /* color: #d6300 */ ee.Geometry.Polygon(
[ [-18.249326106253648,27.619054182178036],
 [-13.316464778128648,27.619054182178036],
 [-13.316464778128648,29.47188119214935],
 [-18.249326106253648,29.47188119214935],
 [-18.249326106253648,27.619054182178036]]);
//shape = Alboran
  var region = shape // shape; // shape or polygon
  Map.addLayer(region,{},'region');  
}


// 1.1 ) Definition of the studied period and season
  var FirstYear = 2018; // First year of the studied period
  var LastYear = 2022;  // Last year of the studied period
    var TimeFrame = ee.List.sequence(FirstYear, LastYear); // Do not modify this variable
    var NumberYears = LastYear - FirstYear + 1; // Do not modify this variable
  var FirstMonth = 1; //First and last month of studied season within each year
  var LastMonth  = 12; //mirar si se puede poner 01 02 03.. Aquí no, pero en string sí
  var ParticularSeason = 0; // use 0 to compute the entire year (1-12). Use 1 when focused on particular set of months

// 1.2) Select Image Collection // Do not modify this section
if (UseRegion == 0) {
  var coll1 = Col.filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31');//ee.ImageCollection('MODIS/006/MOD13Q1').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // EVI y NDVI
  // var coll2 = ee.ImageCollection('MODIS/006/MOD11A2').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // LSTemperature 
  // var coll4 = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31');  // PRECIPITACION CHIRPS UCSB-CHG/CHIRPS/PENTAD
  // var coll5 = ee.ImageCollection('MODIS/006/MOD16A2').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31');  // EVAPOTRANSPIRATION MODIS
  // var coll6 = ee.ImageCollection('MODIS/006/MCD43A3').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // Albedo Collection 006
  //     var coll6 = coll6.map(
  //     function(image){
  //     var NewAlbedoColl = image.expression(
  //     '(BSA + WSA)/2',{
  //       'BSA': image.select('Albedo_BSA_shortwave'),
  //       'WSA': image.select('Albedo_WSA_shortwave')
  //     });
  //     return image.addBands(NewAlbedoColl.rename(['Albedo_MeanB&WSA_shortwave']));
  //     });
  // var coll7 = ee.ImageCollection('MODIS/MCD43A4_006_NDWI').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // NDWI Normalized Difference Water Index
  // var coll8 = ee.ImageCollection('MODIS/MCD43A4_006_NDSI').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // NDSI Normalized Difference Snow Index
  // var coll9 = ee.ImageCollection('MODIS/MCD43A4_006_BAI').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // BAI Burned Area Index
  // var coll10 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_RAW').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // Landsat 7 Tier 1
  var coll11 = ee.Image("WORLDCLIM/V1/BIO")
  // var coll12 = ee.ImageCollection("NASA/OCEANDATA/MODIS-Terra/L3SMI").filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31'); // Modis-Terra Ocean Color

  
}

if (UseRegion == 1){
  var coll1 = Col.filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31');//ee.ImageCollection('MODIS/006/MOD13Q1').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // EVI y NDVI
  // var coll2 = ee.ImageCollection('MODIS/006/MOD11A2').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // LSTemperature 
  // var coll4 = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region);  // PRECIPITACION CHIRPS UCSB-CHG/CHIRPS/PENTAD
  // var coll5 = ee.ImageCollection('MODIS/006/MOD16A2').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region);  // EVAPOTRANSPIRATION MODIS
  // var coll6 = ee.ImageCollection('MODIS/006/MCD43A3').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // Albedo Collection 006
  //     var coll6 = coll6.map(
  //     function(image){
  //     var NewAlbedoColl = image.expression(
  //     '(BSA + WSA)/2',{
  //       'BSA': image.select('Albedo_BSA_shortwave'),
  //       'WSA': image.select('Albedo_WSA_shortwave')
  //     });
  //     return image.addBands(NewAlbedoColl.rename(['Albedo_MeanB&WSA_shortwave']));
  //     });
  // var coll7 = ee.ImageCollection('MODIS/MCD43A4_006_NDWI').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // NDWI Normalized Difference Water Index
  // var coll8 = ee.ImageCollection('MODIS/006/MOD10A1').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // NDSI Normalized Difference Snow Index
  // var coll9 = ee.ImageCollection('MODIS/MCD43A4_006_BAI').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // BAI Burned Area Index
  // var coll10 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_RAW').filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // Landsat 7 Tier 1
  var coll11 = ee.Image("WORLDCLIM/V1/BIO")
  // var coll12 = ee.ImageCollection("NASA/OCEANDATA/MODIS-Terra/L3SMI").filterDate(String(FirstYear)+'-01-01', String(LastYear)+'-12-31').filterBounds(region); // Modis-Terra Ocean Color
}

// 1.3) Select the target variable/spectral index // Only one per time
var SelectedVariable = coll1.select([indice]); // EVI index, selected from the "MODIS/006/MOD13Q1" collection
var SelectedVariableName = indice;
//var SelectedVariable = coll2.select(['LST_Day_1km']); // Land Surface Temperature, selected from the "MODIS/MOD11A2" collection
//var SelectedVariableName = 'LST_Day_1km';
//no//var SelectedVariable = coll3.select(['Albedo_MeanB&WSA_shortwave']); // Albedo, computed from the "MODIS/MCD43B3" collection
//no//var SelectedVariableName = 'Albedo_MeanB&WSA_shortwave';
//var SelectedVariable = coll4.select(['precipitation']); // Precipitation, selected from the "UCSB-CHG/CHIRPS/PENTAD" collection
//var SelectedVariableName = 'precipitation';
//var SelectedVariable = coll5.select(['ET']); // Evapotranspiration from MODIS MOD16A2 006
//var SelectedVariableName = 'ET';
//var SelectedVariable = coll5.select(['PET']); // Potential Evapotranspiration from MODIS MOD16A2
//var SelectedVariableName = 'PET';
//var SelectedVariable = coll5.select(['LE']); // Latent heat from MODIS MOD16A2
//var SelectedVariableName = 'LE';
//var SelectedVariable = coll5.select(['PLE']); // Potential Latent Heat from MODIS MOD16A2
//var SelectedVariableName = 'PLE';
//var SelectedVariable = coll6.select(['Albedo_MeanB&WSA_shortwave']); // Albedo, computed from the "MODIS/006/MCD43A3" collection
//var SelectedVariableName = 'Albedo_MeanB&WSA_shortwave';
//var SelectedVariable = coll7.select(['NDWI']); // NDWI 16day from MODIS
//var SelectedVariableName = 'NDWI';
// var SelectedVariable = coll8.select(['NDSI']); // NDSI 16day from MODIS
// var SelectedVariableName = 'NDSI';
//var SelectedVariable = coll9.select(['BAI']); // BAI 16day from MODIS
//var SelectedVariableName = 'BAI';
//var SelectedVariable = coll10.select(['B10']); // Landsat NDVI
//var SelectedVariableName = 'B10';
//var SelectedVariable = coll12.select(['chlor_a']); // Landsat NDVI
//var SelectedVariableName = 'chlor_a';


var GDriveOutputImgFolder = "EFAs/"+parque;//SpainEVI_Months
var GDriveOutputTableFolder = "GEEOutputNieve";


//////////////////////////////////
///2) COMPUTATION OF VARIABLES ///
//////////////////////////////////

// 1 --> compute the variable. 0 --> do not compute the variable

// 2.1) Annual EFAs //
  var ComputationOfAnnualSums =      0;
  var ComputationOfAnnualMeans =     1;// Aca es median
  var ComputationOfAnnualSDs =       1;
  var ComputationOfAnnualCVs =       1;
  var ComputationOfAnnualMaxima =    1;
  var ComputationOfAnnualMinima =    1;
  var ComputationOfAnnualDMaxs =     1;
  var ComputationOfAnnualSinOfDMax = 1;
  var ComputationOfAnnualCosOfDMax = 1;
  var ComputationOfAnnualDMins =     1;
  var ComputationOfAnnualSinOfDMin = 1;
  var ComputationOfAnnualCosOfDMin = 1;
  var ComputationOfPercentile5 =     1;
  var ComputationOfPercentile95 =    1;

// 2.2) Interannual summaries of annual EFAs. Each one needs its annual EFA //
  var ComputationOfInterAnnualMeanOfAnnualSums =   0;
  var ComputationOfInterAnnualMeanOfAnnualMeans =  1;
  var ComputationOfInterAnnualMeanOfAnnualSDs =    1;
  var ComputationOfInterAnnualMeanOfAnnualCVs =    1;
  var ComputationOfInterAnnualMeanOfAnnualMaxima = 1;
  var ComputationOfInterAnnualMeanOfAnnualMinima = 1;
  var ComputationOfInterAnnualMeanOfAnnualDMaxs =        1; // Interannual mean of DMAX
  var ComputationOfInterAnnualMeanOfAnnualCosOfDMaxs =   1; // Mean of cosines of the timeseries of DMAX
  var ComputationOfInterAnnualMeanOfAnnualSinOfDMaxs =   1; // Mean of sines of the timeseries of DMAX
  var ComputationOfInterAnnualMeanOfAnnualDMaxModule =   1; // Module of the angle of Interannual mean of DMAX
  var ComputationOfInterAnnualMeanOfAnnualDMaxCos =      1; // Cosine of the angle of Interannual mean of DMAX
  var ComputationOfInterAnnualMeanOfAnnualDMaxSin =      1; // Sine of the angle of Interannual mean of DMAX
  var ComputationOfInterAnnualMeanOfAnnualDMins =        1;
  var ComputationOfInterAnnualMeanOfAnnualCosOfDMins =   1;
  var ComputationOfInterAnnualMeanOfAnnualSinOfDMins =   1;
  var ComputationOfInterAnnualMeanOfAnnualDMinModule =   1;
  var ComputationOfInterAnnualMeanOfAnnualDMinCos =      1;
  var ComputationOfInterAnnualMeanOfAnnualDMinSin =      1;
  
  var ComputationOfInterAnnualMedianPercentile5 =        1;
  var ComputationOfInterAnnualMedianPercentile95 =       1;
  
  var ComputationOfInterAnnualSDOfAnnualSums =   0;
  var ComputationOfInterAnnualSDOfAnnualMeans =  1;
  var ComputationOfInterAnnualSDOfAnnualSDs =    1;
  var ComputationOfInterAnnualSDOfAnnualCVs =    1;
  var ComputationOfInterAnnualSDOfAnnualMaxima = 1;
  var ComputationOfInterAnnualSDOfAnnualMinima = 1;
  var ComputationOfInterAnnualSDOfDMaxs =        1;
  var ComputationOfInterAnnualSDOfSinOfDMaxs =   1;
  var ComputationOfInterAnnualSDOfCosOfDMaxs =   1;
  var ComputationOfInterAnnualSDOfDMins =        1;  
  var ComputationOfInterAnnualSDOfSinOfDMins =   1;
  var ComputationOfInterAnnualSDOfCosOfDMins =   1;

// 2.3) Creation of a stack with the EFAs //
  //var CreateStackEFAs =  0; //Mean and SD are included
// If needed we can add the code to build stacks


//////////////////////////////////
///3) VISUALIZATION OF VARIABLES//
//////////////////////////////////

// 3.1) Parameters for the visualization of images.
  // When using EVI or NDVI, from the "MODIS/MOD13Q1" collection --> min:0, max:10000
  // When using LST_Day_1km, from the "MODIS/MOD11A2" collection --> min: , max:
  // When using Albedo --> min: , max:
  // When using CHIRPS, from the "UCSB-CHG/CHIRPS/PENTAD" collection --> min:0, max:500
 
var VisualPams = {min:0, max:10000};  // CHANGE TO THE MINIMUM/MAXIMUM VALUES OF THE VARIABLE RANGE
//DMAX 0296ff,0addff,0effa6,07d83d,42b10a,e4ff06,ffbf0a,ff5c0e,c01d03,d554ff,5541ff,350ed0

//3.2) Annual variables //
  var VisualizeAnnualSums =       0;
  var VisualizeAnnualMeans =      0;
  var VisualizeAnnualSDs =        0;
  var VisualizeAnnualCVs =        0;
  var VisualizeAnnualMaxima =     0;
  var VisualizeAnnualMinima =     0;
  var VisualizeAnnualDMaxs =      0;
  var VisualizeAnnualSinOfDMaxs = 0;
  var VisualizeAnnualCosOfDMaxs = 0;
  var VisualizeAnnualDMins =      0;
  var VisualizeAnnualSinOfDMins = 0;
  var VisualizeAnnualCosOfDMins = 0;

//3.3) Interannual summaries //
  var VisualizeInterAnnualMeanOfAnnualSums =       0;
  var VisualizeInterAnnualMeanOfAnnualMeans =      1;
  var VisualizeInterAnnualMeanOfAnnualSDs =        0;
  var VisualizeInterAnnualMeanOfAnnualCVs =        0;
  var VisualizeInterAnnualMeanOfAnnualMaxima =     0;
  var VisualizeInterAnnualMeanOfAnnualMinima =     0;
  var VisualizeInterAnnualMeanOfAnnualDMaxs =      0; // Interannual mean of DMAX
  var VisualizeInterAnnualMeanOfAnnualCosOfDMaxs = 0; // Mean of cosines of the timeseries of DMAX
  var VisualizeInterAnnualMeanOfAnnualSinOfDMaxs = 0; // Mean of sines of the timeseries of DMAX
  var VisualizeInterAnnualMeanOfDMaxModule =       0; // Module of the angle of Interannual mean of DMAX
  var VisualizeInterAnnualMeanOfDMaxCos =          0; // Cosine of the angle of Interannual mean of DMAX
  var VisualizeInterAnnualMeanOfDMaxSin =          0; // Sine of the angle of Interannual mean of DMAX
  var VisualizeInterAnnualMeanOfAnnualDmins =      0;
  var VisualizeInterAnnualMeanOfAnnualSinOfDMins = 0;
  var VisualizeInterAnnualMeanOfAnnualCosOfDMins = 0;
  var VisualizeInterAnnualMeanOfDMinModule =       0; // Module of the angle of Interannual mean of DMIN
  var VisualizeInterAnnualMeanOfDMinCos =          0; // Cosine of the angle of Interannual mean of DMIN
  var VisualizeInterAnnualMeanOfDMinSin =          0; // Sine of the angle of Interannual mean of DMIN
 // 081bff,08a4ff,06ffe8,08ff8d,13ff04,d9ff06,fff704,ffbd04,ff4b06,ce0329,c208ff,7005e6
  var VisualizeInterAnnualSDOfAnnualSums =   0;
  var VisualizeInterAnnualSDOfAnnualMeans =  0;
  var VisualizeInterAnnualSDOfAnnualSDs =    0;
  var VisualizeInterAnnualSDOfAnnualCVs =    0;
  var VisualizeInterAnnualSDOfAnnualMaxima = 0; 
  var VisualizeInterAnnualSDOfAnnualMinima = 0;
  var VisualizeInterAnnualSDOfAnnualDMaxs =  0;  //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN
  var VisualizeInterAnnualSDOfAnnualDmins =  0;



//////////////////////////////////
/////4) EXPORTATION OF IMAGES/////
//////////////////////////////////
//  Be CAREFUL the whole world must be visualized before exportation of a particular region 
//  Unlike other GIS and image processing platforms, the scale of analysis is determined from the output, rather than the input.
//  The output image pixel at any scale corresponds to the center pixel at the native resolution  https://developers.google.com/earth-engine/scale 
//  If the output pixel size is smaller than the native resolution, GEE makes a spatial interpolation

// 4.1) OUTPUT PIXEL SIZE
 // Native resolution of the product
  var prod = ee.Image(SelectedVariable.first());
  var projection = prod.projection();
  var crs = projection.crs();
  var crs = crs.getInfo();
  var crs = crs.replace(/\:/g, '');
  //print(crs, 'crs')
  var NativeResol = projection.nominalScale();
  var NativeResol = NativeResol.getInfo();
  print(projection, 'proj');
  print('Native Resolution', NativeResol +' m/pixel');

 // Resolution of another external product, e.g. CHIRPS 0.05 DEG
  //var SelectedVariableOutputProjPixelSize = coll4.select(['precipitation']);//CHIRPS
  //var prod = ee.Image(SelectedVariableOutputProjPixelSize.first());//CHIRPS
  var SelectedVariableOutputProjPixelSize = coll11.select(['bio01']);//WORLDCLIM
  var prod = SelectedVariableOutputProjPixelSize;//WORLDCLIM
  var ExternalProjection = prod.projection();
  var Externalcrs = ExternalProjection.crs();
  var Externalcrs = Externalcrs.getInfo();
  var Externalcrs = Externalcrs.replace(/\:/g, '');
  //print(Externalcrs, 'Externalcrs') 
  var ExternalResol = ExternalProjection.nominalScale();
  var ExternalResol = ExternalResol.getInfo();
  //print(ExternalProjection, 'ExternalProj');

  // Select output pixel size: ResolOfExport = Either DefinedByUser OR NativeResol OR ExternalResol
  var DefinedByUser = 100;   // Defined resolution by user (m/pixel)
  var ResolOfExport = NativeResol; // "NativeResol" or "DefinedByUser" or "ExternalResol", deppending on if we want the native resolution of the data o a resolution defined by the user
  print('Scale of Exportation', ResolOfExport +' m/pixel');
  var RoundResol = ResolOfExport.toFixed(); // Resolution rounded to entire number. Do not change this variable
 

// 4.2) EXPORTATION FILENAMES CONFIGURATION
// Filename example: Evi_C006_MOD13Q1_Mean_2001_SR-ORG6974_Pixel231.tif

var Variable = indice+'_'; // This variable must be:
                        //'EVI_' when computing the EVI index
                        //'LST_' when computing the Land Surface Temperature
                        //'Alb_' when computing the Albedo
                        //'Pre_' when computing the Precipation
                        //'NDV_' when computing the NDVI
                        //'ET__' when computing the Evapotranspiration
                        //'PET_' when computing the Potential Evapotranspiration
                        //'LE__' when computing the Latent Heat
                        //'PLE_' when computing the Potential Latent Heat
                        //'NDW_' when computing the NDWI MODIS/MCD43A4_006_NDWI
                        //'NDS_' when computing the NDSI
                        //'BAI_' when computing the BAI
                        //'chl_' when computing the chlor_a

var collectionOfData = 'SR'; // This variable must be C005 or C006, XXXX deppending on the collection of the data used. 
                              // C006 CHECK 
                              // C005 CHECK
                              // PENT when computing the CHIRPS precipitation data.
                              // SR

var product = 'SENTINEL'; // This variable must be, :
                          //  MOD13Q1' when computing the EVI/NDVI index
                          //  MOD11A2' when computing the Land Surface Temperature
                          //  Noooo MCD43B3' when computing the Albedo from C005
                          //  MCD43A3' when computing the Albedo from C006
                          //  CHIRPS_' when computing the Precipitation
                          //  MOD16A2' when computing the ET, PET, LE (latent heat), PEH from MOD16A2
                          //  MCD43A4' when computing the NDWI o NDSI o BAI
                          //  L3SMI__ when computing the chlor_a
                          // SENTINEL
                          // LANDSAT


// EXPORTATION OF ANNUAL VARIABLES ///
// 4.3) Annual variables // 
var ExportationOfAnnualSums =       0;
var ExportationOfAnnualMeans =      0;
var ExportationOfAnnualSDs =        0;
var ExportationOfAnnualCVs =        0;
var ExportationOfAnnualMaxima =     0;
var ExportationOfAnnualMinima =     0;
var ExportationOfAnnualDMaxs =      0;
var ExportationOfAnnualSinOfDMaxs = 0;
var ExportationOfAnnualCosOfDMaxs = 0;
var ExportationOfAnnualDMins =      0; 
var ExportationOfAnnualSinOfDMins = 0;
var ExportationOfAnnualCosOfDMins = 0;
var ExportationOfAnnualPercentile5= 0;
var ExportationOfAnnualPercentile95=0;

// 4.4) Interannual summaries of annual EFAs. Each one needs its annual EFA computated before in 2.2//
var ExportationOfInterAnnualMeanOfAnnualSums =      0;
var ExportationOfInterAnnualMeanOfAnnualMeans =     1;
var ExportationOfInterAnnualMeanOfAnnualSDs =       1;
var ExportationOfInterAnnualMeanOfAnnualCVs =       1;
var ExportationOfInterAnnualMeanOfAnnualMaxima =    0;
var ExportationOfInterAnnualMeanOfAnnualMinima =    0;
var ExportationOfInterAnnualMeanOfAnnualDMax =      1;  //ACTIVAR
var ExportationOfInterAnnualMeanOfAnnualSinOfDMax = 0;
var ExportationOfInterAnnualMeanOfAnnualCosOfDMax = 0;
var ExportationOfInterAnnualMeanOfDMaxModule =      0; // Module of the angle of Interannual mean of DMAX
var ExportationOfInterAnnualMeanOfDMaxCos =         0; // Cosine of the angle of Interannual mean of DMAX
var ExportationOfInterAnnualMeanOfDMaxSin =         0; // Sine of the angle of Interannual mean of DMAX
var ExportationOfInterAnnualMeanOfAnnualDMin =      1; //ACTIVAR
var ExportationOfInterAnnualMeanOfAnnualSinOfDMin = 0;
var ExportationOfInterAnnualMeanOfAnnualCosOfDMin = 0;
var ExportationOfInterAnnualMeanOfDMinModule =      0; // Module of the angle of Interannual mean of DMIN
var ExportationOfInterAnnualMeanOfDMinCos =         0; // Cosine of the angle of Interannual mean of DMIN
var ExportationOfInterAnnualMeanOfDMinSin =         0; // Sine of the angle of Interannual mean of DMIN
var ExportationOfInterAnnualMedianPercentile5 =     1;
var ExportationOfInterAnnualMedianPercentile95 =    1;


var ExportationOfInterAnnualSDOfAnnualSums =        0;
var ExportationOfInterAnnualSDOfAnnualMeans =       0;
var ExportationOfInterAnnualSDOfAnnualSDs =         0;
var ExportationOfInterAnnualSDOfAnnualCVs =         0;//este FALLABA CON NDWI
var ExportationOfInterAnnualSDOfAnnualMaxima =      0;
var ExportationOfInterAnnualSDOfAnnualMinima =      0;                                          
var ExportationOfInterAnnualSDOfAnnualDMax =        0; //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN
var ExportationOfInterAnnualSDOfAnnualSinOfDMax =   0; //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN
var ExportationOfInterAnnualSDOfAnnualCosOfDMax =   0; //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN
var ExportationOfInterAnnualSDOfAnnualDMin =        0; //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN
var ExportationOfInterAnnualSDOfAnnualSinOfDMin =   0; //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN
var ExportationOfInterAnnualSDOfAnnualCosOfDMin =   0; //NO ESTÁ CREADO EL CÓDIGO DE VISUALIACION EN DMAX Y DMIN


///////////////////////////////////////////////////////////////
/////5) EXTRACTION OF GRIDS OR POLYGONS AVERAGES TO TABLES/////
///////////////////////////////////////////////////////////////
//  Be CAREFUL the whole world must be visualized before exportation of a particular region 
//  Unlike other GIS and image processing platforms, the scale of analysis is determined from the output, rather than the input.
//  The output image pixel at any scale corresponds to the center pixel at the native resolution  https://developers.google.com/earth-engine/scale 
//  If the output pixel size is smaller than the native resolution, GEE makes a spatial interpolation
//  Set the output resolution to the native one.

var ExtractionOfValuesAsTables = 0; // Summarize statistics or Statistics as table for each polygon/gridcell
if (ExtractionOfValuesAsTables == 1) {
// Set the shapefile of the polygon or grid
// Prefix for Output Table FileName
//var Shape = ee.FeatureCollection('ft:1ZB2XCozJkzaSyVgrm-gllRlHBAftMg7vSGldChmG');// NWIP 10x10km
//var Shape = ee.FeatureCollection('ft:1JJvMFrrA-g2YKNe11sFyVYoAJEpcWK8Svscc9amv');// IP 5x5km
//var Shape = ee.FeatureCollection('ft:1tquGBqX1IqTAQ-hVaq3xBvmBPLrC6K9-jw05utjw');// IP 1x1km
//var Shape = ee.FeatureCollection('ft:1zCYXuKeCTZZ0_Je3_jvBBCJldxlKr8zbLBeCpMTZ');// IP 1x1km P1d4
//var Shape = ee.FeatureCollection('ft:1zXb5hPMWabn058W-k0xVksFY3aYw1A4QmhH4zGGb');// IP 1x1km P2d4
//var Shape = ee.FeatureCollection('ft:1T4FFAg2l7YYO2ckQTq0We4M8it7ihWeAktIMRSJl');// IP 1x1km P3d4
//var Shape = ee.FeatureCollection('ft:1_XP4NBFUlj80seJe1YfO9QpmUUkAqwYmjO5Y3Mpk');// IP 1x1km P4d4
//var Shape = ee.FeatureCollection('ft:1JNHL8iYjEua6PTPjqzu3WvEpaQlNNbSnPPriZoGq')//10x10 

//var Shape = ee.FeatureCollection('users/dalcaraz/shared/shapesMarzo2017/UTM10x10IP');
//var IdFieldName = 'id'; // 'id10km';
//var TableSufix = 'IP_10x10_'; // 
//var Shape = ee.FeatureCollection('users/dalcaraz/shared/shapesMarzo2017/UTM5x5IP');
//var IdFieldName = 'id';// 'id5km';
//var TableSufix = 'IP_5x5_'; // 
//var Shape = ee.FeatureCollection('users/dalcaraz/shared/shapesMarzo2017/UTM1x1IP');
//var IdFieldName = 'id'; //e.g. 'id1km' 'id'
//var TableSufix = 'IP_1x1_'; // 
var Shape = ee.FeatureCollection('users/dalcaraz/shared/shapesMar2018/RBXP1km');
var IdFieldName = 'Id'; // 'id10km';
var TableSufix = 'RBXP1km_'; // 


//Include the .prj or use Geo WGS84. For introducing shp directly https://developers.google.com/earth-engine/importing 
//Map.addLayer(Shape);

var ExtractionOfAnnualSums =  0; //THIS GROUP IS NOT PROGRAMMED YET
var ExtractionOfAnnualMeans = 0;
var ExtractionOfAnnualSDs =   0;
var ExtractionOfAnnualMaxima =0;
var ExtractionOfAnnualMinima =0;
var ExtractionOfAnnualDMaxs = 0;
var ExtractionOfAnnualDMins = 0;

var ExtractionOfInterAnnualMeanOfAnnualSums =   0; //SUM IS NOT PROGRAMMED YET
var ExtractionOfInterAnnualMeanOfAnnualMeans =  0;
var ExtractionOfInterAnnualMeanOfAnnualSDs =    0;
var ExtractionOfInterAnnualMeanOfAnnualMaxima = 0;
var ExtractionOfInterAnnualMeanOfAnnualMinima = 0;
var ExtractionOfInterAnnualMeanOfAnnualDMaxs =  0; //Sines and Cosines are included by default
var ExtractionOfInterAnnualMeanOfAnnualDMins =  0; //Sines and Cosines are included by default

var ExtractionOfInterAnnualMeanOfDMaxModule =   0; // Module of the angle of Interannual mean of DMAX
var ExtractionOfInterAnnualMeanOfDMaxCos =      0; // Cosine of the angle of Interannual mean of DMAX
var ExtractionOfInterAnnualMeanOfDMaxSin =      0; // Sine of the angle of Interannual mean of DMAX
var ExtractionOfInterAnnualMeanOfDMinModule =   0; // Module of the angle of Interannual mean of DMIN
var ExtractionOfInterAnnualMeanOfDMinCos =      0; // Cosine of the angle of Interannual mean of DMIN
var ExtractionOfInterAnnualMeanOfDMinSin =      0; // Sine of the angle of Interannual mean of DMIN

var ExtractionOfInterAnnualSDOfAnnualSums =   0; //THIS GROUP IS NOT PROGRAMMED YET
var ExtractionOfInterAnnualSDOfAnnualMeans =  0;
var ExtractionOfInterAnnualSDOfAnnualSDs =    0;
var ExtractionOfInterAnnualSDOfAnnualMaxima = 0;
var ExtractionOfInterAnnualSDOfAnnualMinima = 0;
var ExtractionOfInterAnnualSDOfAnnualDMaxs =  0;
var ExtractionOfInterAnnualSDOfAnnualDMins =  0;

}





//Do not modify anything below this line!!!!!!!!

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
///////////////////////////////////////////////////////////////////EFAs CALCULATOR CODE///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////
/////////// 1) COMPUTATION OF THE YEARLY EFAs /////////////////////
/////////////////////////////////////////////////////////////////////

// 1.1) Collection of images, each image with the sum of a year //
if (ComputationOfAnnualSums == 1) {
  var YearlySums = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
      var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.sum());
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var imageSum = VariableMonthly.reduce(ee.Reducer.sum());
        var image = imageSum.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
  if (UseRegion == 1){
    var YearlySums = ee.ImageCollection(YearlySums
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }

// 1.2) Collection of images, each one with the MEAN of a year //
if (ComputationOfAnnualMeans == 1) {
  var YearlyMeans = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
      var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.median());
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var imageMean = VariableMonthly.reduce(ee.Reducer.median());
        var image = imageMean.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
    if (UseRegion == 1){
    var YearlyMeans = ee.ImageCollection(YearlyMeans
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }

// 1.3) Collection of images, each one with the SD of a year of the period //
if (ComputationOfAnnualSDs == 1) {  
  var YearlySDs = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
      var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.stdDev());
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var imageSD = VariableMonthly.reduce(ee.Reducer.stdDev());
        var image = imageSD.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
      if (UseRegion == 1){
    var YearlySDs = ee.ImageCollection(YearlySDs
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }
 
// 1.4) Collection of images, each one with the CV of a year //
if (ComputationOfAnnualCVs == 1) {  
  var YearlyCVs = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
      var imageX = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.stdDev());
      var imageXX = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.mean());
      var image = imageX.divide(imageXX);
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var imageSD = VariableMonthly.reduce(ee.Reducer.stdDev());
        var imageMean = VariableMonthly.reduce(ee.Reducer.mean());
        var imageCV = imageSD.divide(imageMean);
        var image = imageCV.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
      if (UseRegion == 1){
    var YearlyCVs = ee.ImageCollection(YearlyCVs
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }
    
 
// 1.4) Collection of images, each one with the MAXIMUM of a year //
if (ComputationOfAnnualMaxima == 1) {    
    var YearlyMaxima = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
        var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.max());
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var Max = VariableMonthly.reduce(ee.Reducer.max());
        var image = Max.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
        if (UseRegion == 1){
    var YearlyMaxima = ee.ImageCollection(YearlyMaxima
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }
 
// 1.5) Collection of images, each one with the MINIMUM of a year //
if (ComputationOfAnnualMinima == 1) {
var YearlyMinima = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
        var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.min());
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var Min = VariableMonthly.reduce(ee.Reducer.min());
        var image = Min.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
        if (UseRegion == 1){
    var YearlyMinima = ee.ImageCollection(YearlyMinima
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }
    
// 1.6) Collection of images, each one with the DATE OF MAXIMUM of a year //
if (ComputationOfAnnualDMaxs == 1) {
    var MaxMonth = ee.ImageCollection(TimeFrame
        .map(function(y) {
          var start = ee.Date.fromYMD(y, 1, 1);
          var step = start.advance(1, 'year');
          var months = ee.List.sequence(FirstMonth, LastMonth);
          var Variable = SelectedVariable.filterDate(start, step);
          var Evi_mensual = months.map(function(m) {
            var Evi_men = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).mean();
            return  Evi_men.addBands(ee.Image.constant(m).select([0],['month']).int8());
            });
          var Evi_meansual = ee.ImageCollection(Evi_mensual);
          var Max = Evi_meansual.qualityMosaic(SelectedVariableName);
          var DMax = Max.select(['month']);
          return DMax.set('year', y);
        }));
  if (UseRegion == 1){
        var MaxMonth = ee.ImageCollection(MaxMonth
    .map(function(image){
      var xx = image.clip(region);
      return xx;
  }
))}}

// 1.6a) Collection of images, each one with the Sine of DATE OF MAXIMUM of a year //
if (ComputationOfAnnualSinOfDMax == 1) {
    var MaxMonthSin = ee.ImageCollection(TimeFrame
        .map(function(y) {
          var start = ee.Date.fromYMD(y, 1, 1);
          var step = start.advance(1, 'year');
          var months = ee.List.sequence(FirstMonth, LastMonth);
          var Variable = SelectedVariable.filterDate(start, step);
          var Evi_mensual = months.map(function(m) {
            var Evi_men = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).mean();
            return  Evi_men.addBands(ee.Image.constant(m).select([0],['month']).int8());
            });
          var Evi_meansual = ee.ImageCollection(Evi_mensual);
          var Max = Evi_meansual.qualityMosaic(SelectedVariableName);
          var DMax = Max.select(['month']);
          var rad = ((2*Math.PI)/12);
          var DMaxAsRadians = DMax.multiply(rad);
          var SinesMax = DMaxAsRadians.sin();
          return SinesMax.set('year', y);}));
  if (UseRegion == 1){
        var MaxMonthSin = ee.ImageCollection(MaxMonthSin
    .map(function(image){
      var xx = image.clip(region);
      return xx;
  }       
))}}

// 1.6b) Collection of images, each one with the Cosine of DATE OF MAXIMUM of a year //
if (ComputationOfAnnualCosOfDMax == 1) {
    var MaxMonthCos = ee.ImageCollection(TimeFrame
        .map(function(y) {
          var start = ee.Date.fromYMD(y, 1, 1);
          var step = start.advance(1, 'year');
          var months = ee.List.sequence(FirstMonth, LastMonth);
          var Variable = SelectedVariable.filterDate(start, step);
          var Evi_mensual = months.map(function(m) {
            var Evi_men = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).mean();
            return  Evi_men.addBands(ee.Image.constant(m).select([0],['month']).int8());
            });
          var Evi_meansual = ee.ImageCollection(Evi_mensual);
          var Max = Evi_meansual.qualityMosaic(SelectedVariableName);
          var DMax = Max.select(['month']);
          var rad = ((2*Math.PI)/12);
          var DMaxAsRadians = DMax.multiply(rad);
          var CosinesMax = DMaxAsRadians.cos();
          return CosinesMax.set('year', y);}));
  if (UseRegion == 1){
        var MaxMonthCos = ee.ImageCollection(MaxMonthCos
    .map(function(image){
      var xx = image.clip(region);
      return xx;
  }        
))}}

// 1.7) Collection of images, each one with the DATE OF MINIMUM of a year //
if (ComputationOfAnnualDMins == 1) {
    var MinMonth = ee.ImageCollection(TimeFrame
      .map(function(y) {
        var start = ee.Date.fromYMD(y, 1, 1);
        var step = start.advance(1, 'year');
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Evi = SelectedVariable.filterDate(start, step);
        var Evi_mensual = months.map(function(m) {
          // Filter to 1 month.
          var Evi_men0 = Evi.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          // add month band for DMin
          var Evi_menMin = Evi_men0.multiply(-1);
          return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
          });
        var Evi_mensualMin = ee.ImageCollection(Evi_mensual);
        var Min = Evi_mensualMin.qualityMosaic(SelectedVariableName);
        var DMin = Min.select(['month']);
        return DMin.set('year', y);
        }));
    if (UseRegion == 1) {
    var MinMonth = ee.ImageCollection(MinMonth
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }        
}

// 1.7a) Collection of images, each one with the Sine of DATE OF MINIMUM of a year //
if (ComputationOfAnnualSinOfDMin == 1) {
    var MinMonthSin = ee.ImageCollection(TimeFrame
        .map(function(y) {
          var start = ee.Date.fromYMD(y, 1, 1);
          var step = start.advance(1, 'year');
          var months = ee.List.sequence(FirstMonth, LastMonth);
          var Evi = SelectedVariable.filterDate(start, step);
          var Evi_mensual = months.map(function(m) {
            // Filter to 1 month.
            var Evi_men0 = Evi.filter(ee.Filter.calendarRange(m, m, 'month')).max();
            // add month band for DMin
            var Evi_menMin = Evi_men0.multiply(-1);
            return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
            });
          var Evi_mensualMin = ee.ImageCollection(Evi_mensual);
          var Min = Evi_mensualMin.qualityMosaic(SelectedVariableName);
          var DMin = Min.select(['month']);
          var rad = ((2*Math.PI)/12);
          var DMinAsRadians = DMin.multiply(rad);
          var SinesMin = DMinAsRadians.sin();
          return SinesMin.set('year', y);}));
  if (UseRegion == 1){
        var MinMonthSin = ee.ImageCollection(MinMonthSin
    .map(function(image){
      var xx = image.clip(region);
      return xx;
  }       
))}}

// 1.7b) Collection of images, each one with the Cosine of DATE OF MINIMUM of a year //
if (ComputationOfAnnualCosOfDMin == 1) {
    var MinMonthCos = ee.ImageCollection(TimeFrame
        .map(function(y) {
          var start = ee.Date.fromYMD(y, 1, 1);
          var step = start.advance(1, 'year');
          var months = ee.List.sequence(FirstMonth, LastMonth);
          var Evi = SelectedVariable.filterDate(start, step);
          var Evi_mensual = months.map(function(m) {
            // Filter to 1 month.
            var Evi_men0 = Evi.filter(ee.Filter.calendarRange(m, m, 'month')).max();
            // add month band for DMin
            var Evi_menMin = Evi_men0.multiply(-1);
            return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
            });
          var Evi_mensualMin = ee.ImageCollection(Evi_mensual);
          var Min = Evi_mensualMin.qualityMosaic(SelectedVariableName);
          var DMin = Min.select(['month']);
          var rad = ((2*Math.PI)/12);
          var DMinAsRadians = DMin.multiply(rad);
          var CosinesMin = DMinAsRadians.cos();
          return CosinesMin.set('year', y);}));
  if (UseRegion == 1){
        var MinMonthCos = ee.ImageCollection(MinMonthCos
    .map(function(image){
      var xx = image.clip(region);
      return xx;
  }        
))}}

// 1.8) Collection of images, each one with the PERCENTILE 5 of a year //
if (ComputationOfPercentile5 == 1) {
  var YearlyPercentile5 = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
      var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.percentile([5]));
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var imageMean = VariableMonthly.reduce(ee.Reducer.percentile(5));
        var image = imageMean.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
    if (UseRegion == 1){
    var YearlyPercentile5 = ee.ImageCollection(YearlyPercentile5
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }

// 1.9) Collection of images, each one with the PERCENTILE 95 of a year //
if (ComputationOfPercentile95 == 1) {
  var YearlyPercentile95 = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      if (ParticularSeason == 0){
      var image = SelectedVariable.filterDate(start, step).reduce(ee.Reducer.percentile([95]));
      }
      if (ParticularSeason == 1){
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var VariableMonthly = ee.ImageCollection(months.map(function(m) {
          var VarInMonths = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).max();
          return  VarInMonths;//.addBands(ee.Image.constant(m).select([0],['month']).int8());
          }));
        var imageMean = VariableMonthly.reduce(ee.Reducer.percentile([95]));
        var image = imageMean.select(0);// to select the first band
      }
      return image.set('year', y);
  }));
    if (UseRegion == 1){
    var YearlyPercentile95 = ee.ImageCollection(YearlyPercentile95
    .map(function(image){
      var xx = image.clip(region);
      return xx;
    }));
      }
    }
////////////////////////////////////////////////////////////////////
/////////// 2) COMPUTATION OF INTER-ANNUAL EFAs SUMMARIES ////////
////////////////////////////////////////////////////////////////////

  // 2.1) Mean of the Sums of the period
  if (ComputationOfInterAnnualMeanOfAnnualSums == 1){
    var InterAnnualMeanOfAnnualSums = YearlySums.median();
    }

  // 2.2) Mean of the Means of the period
  if (ComputationOfInterAnnualMeanOfAnnualMeans == 1) {
    var InterAnnualMeanOfAnnualMeans = YearlyMeans.median();
    }
 
  // 2.3) Mean of the SD means of the period
  if (ComputationOfInterAnnualMeanOfAnnualSDs == 1) {
    var InterAnnualMeanOfAnnualSDs = YearlySDs.median();
    }
    
  // 2.4) Mean of the CV means of the period
  if (ComputationOfInterAnnualMeanOfAnnualCVs == 1) {
    var InterAnnualMeanOfAnnualCVs = YearlyCVs.median();
  }
 
  // 2.4) Mean of the Max means of the period.
  if (ComputationOfInterAnnualMeanOfAnnualMaxima == 1) {
    var InterAnnualMeanOfAnnualMaxima = YearlyMaxima.median();
    }
 
  // 2.5) Mean of the Min means of the period
  if (ComputationOfInterAnnualMeanOfAnnualMinima == 1) {
    var InterAnnualMeanOfAnnualMinima = YearlyMinima.median();
  }
 
  // 2.6) Mean of the DMaxs of the period //
  if (ComputationOfInterAnnualMeanOfAnnualDMaxs == 1) {
    var YearlyMonthMax = ee.ImageCollection(TimeFrame
      .map(function(y) {
        var start = ee.Date.fromYMD(y, 1, 1);
        var step = start.advance(1, 'year');
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var MonthlyVariableMax = months.map(function(m) {
          var MonthVariableMax = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).median();
          return  MonthVariableMax.addBands(ee.Image.constant(m).select([0],['month']).int8());
          });
        var MonthlyVariableMaxColl = ee.ImageCollection(MonthlyVariableMax);
        var Max = MonthlyVariableMaxColl.qualityMosaic(SelectedVariableName);
        var DMax = Max.select(['month']);
        return DMax.set('year', y);
        }));
          var MonthsAsRadiansMax = YearlyMonthMax.map(function(image){
            var rad = ((2*Math.PI)/12);
            return image.multiply(rad);
          });
          var CosinesMax = MonthsAsRadiansMax.map(function(image){
            return image.cos();
          });
          var SumCosinesMax = CosinesMax.reduce(ee.Reducer.sum());
          var MeanCosinesMax = SumCosinesMax.divide(NumberYears);
          var SinesMax = MonthsAsRadiansMax.map(function(image){
            return image.sin();
          });
          var SumSinesMax = SinesMax.reduce(ee.Reducer.sum());
          var MeanSinesMax = SumSinesMax.divide(NumberYears);//AQUÍ SE PODRÍA METER EL CAMBIO DE TAMAÑO DE PÍXEL
        var ArctanMax = MeanCosinesMax.atan2(MeanSinesMax);
        var AtanCorrMax = ((ArctanMax.lt(0)).multiply(ArctanMax.add(2*(Math.PI)))).add((ArctanMax.gt(0)).multiply(ArctanMax));
        var Month_aMax = (AtanCorrMax.multiply(12));
        var DMaxSummaryOfPeriod =(Month_aMax.divide((2*(Math.PI))));
       if (UseRegion == 1) {
        var DMaxSummaryOfPeriod = DMaxSummaryOfPeriod.clip(region);
       }
  }
  // Mean of the Cosines of the DMaxs of the period
if  (ComputationOfInterAnnualMeanOfAnnualCosOfDMaxs == 1){  
  var MaxMonth1 = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      var months = ee.List.sequence(FirstMonth, LastMonth);
      var Variable = SelectedVariable.filterDate(start, step);
      var MonthlyVariableMax = months.map(function(m) {
        // Filter to 1 month.
        var MonthVariableMax = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).median();
        // add month band for DMax
        //kk
        return  MonthVariableMax.addBands(ee.Image.constant(m).select([0],['month']).int8());
        });
      var MonthlyVariableMaxColl = ee.ImageCollection(MonthlyVariableMax);
      var Max = MonthlyVariableMaxColl.qualityMosaic(SelectedVariableName);
      var DMax = Max.select(['month']);
      return DMax.set('year', y);
      }));

      // Month of max in radians
        var MonthsAsRadiansMax = MaxMonth1.map(function(image){
          var rad = ((2*Math.PI)/12);
          return image.multiply(rad);
        });
      
      // Computation of Cosines
        var CosinesMax = MonthsAsRadiansMax.map(function(image){
          return image.cos();
        });
        var SumCosinesMax = CosinesMax.reduce(ee.Reducer.sum());
        var MeanCosinesMax = SumCosinesMax.divide(NumberYears); //División de la suma de cosenos por el número de imágenes/años

    if(UseRegion == 1){    
      var MeanCosinesMax = MeanCosinesMax.clip(region);
    }
}


  // Mean of the Sines of the DMaxs of the period
  if  (ComputationOfInterAnnualMeanOfAnnualSinOfDMaxs == 1){  
    var MaxMonth2 = ee.ImageCollection(TimeFrame
      .map(function(y) {
        var start = ee.Date.fromYMD(y, 1, 1);
        var step = start.advance(1, 'year');
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var MonthlyVariableMax = months.map(function(m) {
          // Filter to 1 month.
          var MonthVariableMax = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).median();
          // add month band for DMax
          return  MonthVariableMax.addBands(ee.Image.constant(m).select([0],['month']).int8());
          });
        var MonthlyVariableMaxColl = ee.ImageCollection(MonthlyVariableMax);
        var Max = MonthlyVariableMaxColl.qualityMosaic(SelectedVariableName);
        var DMax = Max.select(['month']);
        return DMax.set('year', y);
        }));
 
        // Month of max in radians
          var MonthsAsRadiansMax = MaxMonth2.map(function(image){
            var rad = ((2*Math.PI)/12);
            return image.multiply(rad);
          });
        
        // Computation of Sines
          var SineMax = MonthsAsRadiansMax.map(function(image){
            return image.sin();
          });
          var SumSinesMax = SinesMax.reduce(ee.Reducer.sum());
          var MeanSinesMax = SumSinesMax.divide(NumberYears); //División de la suma de cosenos por el número de imágenes/años
      
      if(UseRegion == 1){    
          var MeanSinesMax = MeanSinesMax.clip(region);
      }
}



// Module of the angle of Interannual mean of DMAX
if  (ComputationOfInterAnnualMeanOfAnnualDMaxModule == 1){  
  var DMaxSummaryOfPeriodModule = ((MeanSinesMax.pow(2)).add(MeanCosinesMax.pow(2))).pow(1/2);
  if (UseRegion == 1){
    var DMaxSummaryOfPeriodModule = DMaxSummaryOfPeriodModule.clip(region);
  }
}

// Cosine of the angle of Interannual mean of DMAX
if  (ComputationOfInterAnnualMeanOfAnnualDMaxCos == 1){  
  var DMaxSummaryOfPeriod = ee.Image(DMaxSummaryOfPeriod);
  var rad = ((2*Math.PI)/12);
  var DMaxSummaryOfPeriodAsRadians = DMaxSummaryOfPeriod.multiply(rad);
  var DMaxSummaryOfPeriodCos = DMaxSummaryOfPeriodAsRadians.cos();
  if (UseRegion == 1){
    var DMaxSummaryOfPeriodCos = DMaxSummaryOfPeriodCos.clip(region);
  }
}

// Sine of the angle of Interannual mean of DMAX
if  (ComputationOfInterAnnualMeanOfAnnualDMaxSin == 1){  
  var DMaxSummaryOfPeriod = ee.Image(DMaxSummaryOfPeriod);
  var rad = ((2*Math.PI)/12);
  var DMaxSummaryOfPeriodAsRadians = DMaxSummaryOfPeriod.multiply(rad);
  var DMaxSummaryOfPeriodSin = DMaxSummaryOfPeriodAsRadians.sin();
  if (UseRegion == 1){
    var DMaxSummaryOfPeriodSin = DMaxSummaryOfPeriodSin.clip(region);
  }
}



// 2.7) Mean of the DMins of the period //
  if (ComputationOfInterAnnualMeanOfAnnualDMins == 1) {
      var YearlyMonthMin = ee.ImageCollection(TimeFrame
      .map(function(y) {
        var start = ee.Date.fromYMD(y, 1, 1);
        var step = start.advance(1, 'year');
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Evi = SelectedVariable.filterDate(start, step);
        var Evi_mensualMin = months.map(function(m) {
          var Evi_men0Min = Evi.filter(ee.Filter.calendarRange(m, m, 'month')).min();
          var Evi_menMin = Evi_men0Min.multiply(-1);
          return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
          });
        var Evi_mensualMinColl = ee.ImageCollection(Evi_mensualMin);
        var Min = Evi_mensualMinColl.qualityMosaic(SelectedVariableName);
        var DMin = Min.select(['month']);
        return DMin.set('year', y);
        }));
      var MonthsAsRadiansMin = YearlyMonthMin.map(function(image){
        var rad = ((2*Math.PI)/12);
        return image.multiply(rad);
      });
      var CosinesMin = MonthsAsRadiansMin.map(function(image){
        return image.cos();
      });
      var SumCosinesMin = CosinesMin.reduce(ee.Reducer.sum());
      var MeanCosinesMin = SumCosinesMin.divide(NumberYears);
      var SinesMin = MonthsAsRadiansMin.map(function(image){
        return image.sin();
      });
      var SumSinesMin = SinesMin.reduce(ee.Reducer.sum());
      var MeanSinesMin = SumSinesMin.divide(NumberYears);
      // Compute the direction of the DMIN.
      var ArctanMin = MeanCosinesMin.atan2(MeanSinesMin);
      var AtanCorrMin = ((ArctanMin.lt(0)).multiply(ArctanMin.add(2*(Math.PI)))).add((ArctanMin.gt(0)).multiply(ArctanMin));
      var Month_aMin = (AtanCorrMin.multiply(12));
      var DMinSummaryOfPeriod =(Month_aMin.divide((2*(Math.PI))));
    if (UseRegion == 1){
      var DMinSummaryOfPeriod = DMinSummaryOfPeriod.clip(region);
    }  
}  
 
   // Mean of the Cosines of the DMins of the period
if (ComputationOfInterAnnualMeanOfAnnualCosOfDMins == 1) {
 var MinMonth1 = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      var months = ee.List.sequence(FirstMonth, LastMonth);
      var Variable = SelectedVariable.filterDate(start, step);
      var Evi_mensualMin = months.map(function(m) {
        // Filter to 1 month.
        var Evi_men0Min = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).min();
        // add month band for MMin
        var Evi_menMin = Evi_men0Min.multiply(-1);
        return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
        });
      var Evi_mensualMinColl = ee.ImageCollection(Evi_mensualMin);
      //print(Evi_mensual);
     
      var Min = Evi_mensualMinColl.qualityMosaic(SelectedVariableName);
      //print(Max)
      var MMin = Min.select(['month']);
      //print (MMax)
      return MMin.set('year', y);
      }));

    // Month of max in radians
        var MonthsAsRadiansMin = MinMonth1.map(function(image){
          var rad = ((2*Math.PI)/12);
          return image.multiply(rad);
        });
        
      // Computation of Cosines
        var CosinesMin = MonthsAsRadiansMin.map(function(image){
          return image.cos();
          });
        var SumCosinesMin = CosinesMin.reduce(ee.Reducer.sum());
        var MeanCosinesMin = SumCosinesMin.divide(NumberYears); //División de la suma de cosenos por el número de imágenes/años

    if (UseRegion == 1){
      var MeanCosinesMin = MeanCosinesMin.clip(region);
    }         
}        
 
   // Mean of the Sines of the DMins of the period
if (ComputationOfInterAnnualMeanOfAnnualSinOfDMins == 1) {
 var MinMonth2 = ee.ImageCollection(TimeFrame
    .map(function(y) {
      var start = ee.Date.fromYMD(y, 1, 1);
      var step = start.advance(1, 'year');
      var months = ee.List.sequence(FirstMonth, LastMonth);
      var Variable = SelectedVariable.filterDate(start, step);
      var Evi_mensualMin = months.map(function(m) {
        // Filter to 1 month.
        var Evi_men0Min = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).min();
        // add month band for MMin
        var Evi_menMin = Evi_men0Min.multiply(-1);
        return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
        });
      var Evi_mensualMinColl = ee.ImageCollection(Evi_mensualMin);
      //print(Evi_mensual);
     
      var Min = Evi_mensualMinColl.qualityMosaic(SelectedVariableName);
      //print(Max)
      var MMin = Min.select(['month']);
      //print (MMax)
      return MMin.set('year', y);
      }));

    // Month of max in radians
        var MonthsAsRadiansMin = MinMonth2.map(function(image){
          var rad = ((2*Math.PI)/12);
          return image.multiply(rad);
        });
        
      // Computation of Sines
        var SinesMin = MonthsAsRadiansMin.map(function(image){
          return image.sin();
          });
        var SumSinesMin = SinesMin.reduce(ee.Reducer.sum());
        var MeanSinesMin = SumSinesMin.divide(NumberYears); //División de la suma de cosenos por el número de imágenes/años
    if (UseRegion == 1){
      var MeanSinesMin = MeanSinesMin.clip(region);
    }         
}   

// Module of the angle of Interannual mean of DMIN
if  (ComputationOfInterAnnualMeanOfAnnualDMinModule == 1){  
  var DMinSummaryOfPeriodModule = ((MeanSinesMin.pow(2)).add(MeanCosinesMin.pow(2))).pow(1/2);
  if (UseRegion == 1){
    var DMinSummaryOfPeriodModule = DMinSummaryOfPeriodModule.clip(region);
  }
}

// Cosine of the angle of Interannual mean of DMIN
if  (ComputationOfInterAnnualMeanOfAnnualDMinCos == 1){  
  var DMinSummaryOfPeriod = ee.Image(DMinSummaryOfPeriod);
  var rad = ((2*Math.PI)/12);
  var DMinSummaryOfPeriodAsRadians = DMinSummaryOfPeriod.multiply(rad);
  var DMinSummaryOfPeriodCos = DMinSummaryOfPeriodAsRadians.cos();
  if (UseRegion == 1){
    var DMinSummaryOfPeriodCos = DMinSummaryOfPeriodCos.clip(region);
  }
}

// Sine of the angle of Interannual mean of DMIN
if  (ComputationOfInterAnnualMeanOfAnnualDMinSin == 1){  
  var DMinSummaryOfPeriod = ee.Image(DMinSummaryOfPeriod);
  var rad = ((2*Math.PI)/12);
  var DMinSummaryOfPeriodAsRadians = DMinSummaryOfPeriod.multiply(rad);
  var DMinSummaryOfPeriodSin = DMinSummaryOfPeriodAsRadians.sin();
  if (UseRegion == 1){
    var DMinSummaryOfPeriodSin = DMinSummaryOfPeriodSin.clip(region);
  }
}

 

 




  // 2.8) SD of the Sums of the period
  if (ComputationOfInterAnnualSDOfAnnualSums == 1){
    var InterAnnualSDOfAnnualSums = YearlySums.reduce(ee.Reducer.stdDev());
    }

  // 2.9) SD of the Means of the period
  if (ComputationOfInterAnnualSDOfAnnualMeans == 1) {
    var InterAnnualSDOfAnnualMeans = YearlyMeans.reduce(ee.Reducer.stdDev());
    }
 
  // 2.10) SD of the SD means of the period
  if (ComputationOfInterAnnualSDOfAnnualSDs == 1) {
    var InterAnnualSDOfAnnualSDs = YearlySDs.reduce(ee.Reducer.stdDev());
    }
    
  // 2.11) SD of the CV means of the period
  if (ComputationOfInterAnnualSDOfAnnualCVs == 1) {
    var InterAnnualSDOfAnnualCVs = YearlyCVs.reduce(ee.Reducer.stdDev());
  }
 
  // 2.12) SD of the Max means of the period.
  if (ComputationOfInterAnnualSDOfAnnualMaxima == 1) {
    var InterAnnualSDOfAnnualMaxima = YearlyMaxima.reduce(ee.Reducer.stdDev());
    }
 
  // 2.13) SD of the Min means of the period
  if (ComputationOfInterAnnualSDOfAnnualMinima == 1) {
    var InterAnnualSDOfAnnualMinima = YearlyMinima.reduce(ee.Reducer.stdDev());
  }
// We should include here the interannual SD (or Siham's variability) for DMax and DMin


  // 2.14) Mean of the Min means of the period
  if (ComputationOfInterAnnualMedianPercentile5 == 1) {
    var InterAnnualMedianPercentile5 = YearlyPercentile5.median();
  }


  // 2.15) Mean of the Min means of the period
  if (ComputationOfInterAnnualMedianPercentile95 == 1) {
    var InterAnnualMedianPercentile95 = YearlyPercentile95.median();
  }
///////////////////////////////////////
// 4) VISUALIZATION OF IMAGES IN GEE //
///////////////////////////////////////

/////////////////////////////////////////////////
///////4.1) VISUALIZATION OF YEARLY EFAs ////////
/////////////////////////////////////////////////

//  4.1.1) Visualization of the sum of each year //
  if (VisualizeAnnualSums == 1) {
    var list = YearlySums.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, VisualPams, name + '_Sum', i === 0);
    }
  }
 
//  4.1.2) Visulization of the mean of each year //
  if (VisualizeAnnualMeans == 1) {
    var list = YearlyMeans.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, VisualPams, name + '_Mean', i === 0);
    }
  }
 
//  4.1.3) Visulization of the SD of each year //
  if (VisualizeAnnualSDs == 1) {
    var list = YearlySDs.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, VisualPams, name + '_sSD', i === 0);
    }
  }

// 4.1.4) Visualization of the CV of each year //
  if (VisualizeAnnualCVs == 1) {
    var list = YearlyCVs.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, {min:0, max:1}, name + '_sCV', i === 0);
    }
  }
 
//  4.1.4) Visulization of the maximum of each year //
  if (VisualizeAnnualMaxima == 1) {  
    var list = YearlyMaxima.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, VisualPams, name  + '_Max', i === 0);
    }
  }
 
//  4.1.5) Visualization of the minimum of each year //
  if (VisualizeAnnualMinima == 1) {  
    var list = YearlyMinima.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, VisualPams, name + '_Min', i === 0);
    }
  }
 
// 4.1.6) Visualization of the DMax of each year //
  if (VisualizeAnnualDMaxs == 1) {
    var list = MaxMonth.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo()
      Map.addLayer(image, {min:1, max:12}, name + '_Dmax', i === 0);
    }
  }

// 4.1.6a) Visualization of the Sines of DMax of each year //
  if (VisualizeAnnualSinOfDMaxs == 1) {
    var list = MaxMonthSin.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo()
      Map.addLayer(image, {min:-1, max:1}, name + '_DmaxSin', i === 0);
    }
  } 
 
// 4.1.6b) Visualization of the Cosines of DMax of each year //
  if (VisualizeAnnualCosOfDMaxs == 1) {
    var list = MaxMonthCos.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo()
      Map.addLayer(image, {min:-1, max:1}, name + '_DmaxCos', i === 0);
    }
  } 

 // 4.1.7) Visualization of the DMin of each year //  
  if (VisualizeAnnualDMins == 1) {
    var list = MinMonth.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Map.addLayer(image, {min:1, max:12}, name + '_DMin', i === 0);
    }
  }  
 
// 4.1.7a) Visualization of the Sines of DMin of each year //
  if (VisualizeAnnualSinOfDMins == 1) {
    var list = MinMonthSin.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo()
      Map.addLayer(image, {min:-1, max:1}, name + '_DminSin', i === 0);
    }
  } 
 
// 4.1.7b) Visualization of the Cosines of DMin of each year //
  if (VisualizeAnnualCosOfDMins == 1) {
    var list = MinMonthCos.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo()
      Map.addLayer(image, {min:-1, max:1}, name + '_DminCos', i === 0);
    }
  } 
    
////////////////////////////////////////////////////////////    
///// 4.2) VISUALIZATION OF EFA SUMMARIES OF THE PERIOD ////
////////////////////////////////////////////////////////////

//  4.2.1) Visualization of the Sums summary of the period //
    if (VisualizeInterAnnualMeanOfAnnualSums == 1) {
        Map.addLayer(InterAnnualMeanOfAnnualSums, VisualPams, 'InterAnnualSumsSummary');
    }

//  4.2.2) Visualization of the Means summary of the period //  
    if (VisualizeInterAnnualMeanOfAnnualMeans == 1) {
    Map.addLayer(InterAnnualMeanOfAnnualMeans, VisualPams, 'InterAnnualMeansSummary');
    }

//  4.2.3) Visualization of the SDs summary of the period //   
    if (VisualizeInterAnnualMeanOfAnnualSDs == 1) {
    Map.addLayer(InterAnnualMeanOfAnnualSDs, VisualPams, 'InterAnnualSDsSummary');
    }

//  4.2.3) Visualization of the CVs summary of the period //   
    if (VisualizeInterAnnualMeanOfAnnualCVs == 1) {
    Map.addLayer(InterAnnualMeanOfAnnualCVs, {min:0, max:1}, 'InterAnnualCVsSummary');
    }
    
//  4.2.4) Visualization of the Maxima summary of the period //    
    if (VisualizeInterAnnualMeanOfAnnualMaxima == 1) {
    Map.addLayer(InterAnnualMeanOfAnnualMaxima, VisualPams, 'InterAnnualMaxSummary');
    }

//  4.2.5) Visualization of the Minima summary of the period //
    if (VisualizeInterAnnualMeanOfAnnualMinima == 1) {
    Map.addLayer(InterAnnualMeanOfAnnualMinima, VisualPams, 'InterAnnualMinSummary');
    }

//  4.2.6) Visualization of the DMax summary of the period //
    if(VisualizeInterAnnualMeanOfAnnualDMaxs == 1) {
    Map.addLayer(DMaxSummaryOfPeriod, {min:1, max:12}, 'InterAnnualDMax');  
    }
//  4.2.6a) Visualization of the Mean of the DMax Sines  of the period //
    if(VisualizeInterAnnualMeanOfAnnualSinOfDMaxs == 1) {
    Map.addLayer(MeanSinesMax, {min:-1, max:1}, 'InterAnnualDMaxMeanOfSines');  
    }
//  4.2.6b) Visualization of the Mean of the DMax Cosines  of the period //
    if(VisualizeInterAnnualMeanOfAnnualCosOfDMaxs == 1) {
    Map.addLayer(MeanCosinesMax, {min:-1, max:1}, 'InterAnnualDMaxMeanOfCosines');  
    }
//  4.2.6c) Visualization of the Module of the DMax of the period //
    if(VisualizeInterAnnualMeanOfDMaxModule == 1) {
    Map.addLayer(DMaxSummaryOfPeriodModule, {min:0, max:NumberYears}, 'InterAnnualDMaxModule');  
    }
//  4.2.6d) Visualization of the Cosine of the DMax of the period //
    if(VisualizeInterAnnualMeanOfDMaxCos == 1) {
    Map.addLayer(DMaxSummaryOfPeriodCos, {min:-1, max:1}, 'InterAnnualDMaxCos');  
    }
//  4.2.6e) Visualization of the Sine of the DMax of the period //
    if(VisualizeInterAnnualMeanOfDMaxSin == 1) {
    Map.addLayer(DMaxSummaryOfPeriodSin, {min:-1, max:1}, 'InterAnnualDMaxSin');  
    }

//  4.2.7) Visualization of the DMin summary of the period //
    if(VisualizeInterAnnualMeanOfAnnualDmins == 1) {
    Map.addLayer(DMinSummaryOfPeriod, {min:1, max:12}, 'InterAnnualDMin');  
    }
//  4.2.7a) Visualization of the Mean of the DMin Sines of the period //
    if(VisualizeInterAnnualMeanOfAnnualSinOfDMins == 1) {
    Map.addLayer(MeanSinesMin, {min:-1, max:1}, 'InterAnnualDMinMeanOfSines');  
    }
//  4.2.7b) Visualization of the Mean of the DMin Cosines of the period //
    if(VisualizeInterAnnualMeanOfAnnualCosOfDMins == 1) {
    Map.addLayer(MeanCosinesMin, {min:-1, max:1}, 'InterAnnualDMinMeanOfCosines');  
    }
//  4.2.7c) Visualization of the Module of the DMin of the period //
    if(VisualizeInterAnnualMeanOfDMinModule == 1) {
    Map.addLayer(DMinSummaryOfPeriodModule, {min:0, max:NumberYears}, 'InterAnnualDMinModule');  
    }
//  4.2.7d) Visualization of the Cosine of the DMin of the period //
    if(VisualizeInterAnnualMeanOfDMinCos == 1) {
    Map.addLayer(DMinSummaryOfPeriodCos, {min:-1, max:1}, 'InterAnnualDMinCos');  
    }
//  4.2.7e) Visualization of the Sine of the DMin of the period //
    if(VisualizeInterAnnualMeanOfDMinSin == 1) {
    Map.addLayer(DMinSummaryOfPeriodSin, {min:-1, max:1}, 'InterAnnualDMinSin');  
    }

///// Standard Deviations ////
//  4.2.8) Visualization of the Sums SD of the period //
    if (VisualizeInterAnnualSDOfAnnualSums == 1) {
        Map.addLayer(InterAnnualSDOfAnnualSums, VisualPams, 'InterAnnualSumsSD');
    }

//  4.2.9) Visualization of the Means SD of the period //  
    if (VisualizeInterAnnualSDOfAnnualMeans == 1) {
    Map.addLayer(InterAnnualSDOfAnnualMeans, VisualPams, 'InterAnnualMeansSD');
    }

//  4.2.10) Visualization of the SDs SD of the period //   
    if (VisualizeInterAnnualSDOfAnnualSDs == 1) {
    Map.addLayer(InterAnnualSDOfAnnualSDs, VisualPams, 'InterAnnualSDsSD');
    }

//  4.2.11) Visualization of the CVs SD of the period //   
    if (VisualizeInterAnnualSDOfAnnualCVs == 1) {
    Map.addLayer(InterAnnualSDOfAnnualCVs, {min:0, max:1}, 'InterAnnualCVsSD');
    }
    
//  4.2.12) Visualization of the Maxima SD of the period //    
    if (VisualizeInterAnnualSDOfAnnualMaxima == 1) {
    Map.addLayer(InterAnnualSDOfAnnualMaxima, VisualPams, 'InterAnnualMaxSD');
    }

//  4.2.13) Visualization of the Minima SD of the period //
    if (VisualizeInterAnnualSDOfAnnualMinima == 1) {
    Map.addLayer(InterAnnualSDOfAnnualMinima, VisualPams, 'InterAnnualMinSD');
    }  
    
//////////////////////////////////////
//5) IMAGES EXPORTATION TO GOOGLE DRIVE//
//////////////////////////////////////

/// Si quisiera resamplear
// Define un booleano para determinar si se debe aplicar la función de reproyección
var resampling = false; // Puedes cambiar esto a false si no deseas aplicar la reproyección

// Define la función que aplica la lógica de reproyección
var applyReprojection = function(imagen, booleano) {
  // Aplica la función de reproyección si el booleano es verdadero
  if (booleano) {
    var imagenReproyectada = imagen.reproject({
        crs: 'EPSG:3035',
        scale: 100
      })
      .reduceResolution({
        reducer: ee.Reducer.mean(),
        maxPixels: 1024
      })
      .reproject({
        crs: 'EPSG:3035',
        crsTransform: [100, 0, 3092821.3055, 0, -100, 1714044.8749]
      });
    // Retorna la imagen reproyectada
    return imagenReproyectada;
  } else {
    // Si el booleano es falso, retorna la imagen original
    return imagen;
  }
};


// Aplica la función a cada una de las imágenes
// Anual
// AnnualMeans  = applyReprojection(AnnualMeans, resampling);
// AnnualSDs = applyReprojection(AnnualSDs, resampling);
// AnnualCVs = applyReprojection(AnnualCVs, resampling);
// AnnualMaxima = applyReprojection(AnnualMaxima, resampling);
// AnnualMinima = applyReprojection(AnnualMinima, resampling);
// AnnualDMaxs = applyReprojection(AnnualDMaxs, resampling);
// AnnualSinOfDMax = applyReprojection(AnnualSinOfDMax, resampling);
// AnnualCosOfDMax = applyReprojection(AnnualCosOfDMax, resampling);
// AnnualDMins = applyReprojection(AnnualDMins, resampling);
// AnnualSinOfDMin = applyReprojection(AnnualSinOfDMin, resampling);
// AnnualCosOfDMin = applyReprojection(AnnualCosOfDMin, resampling);

// INterannual ;
// InterAnnualMeanOfAnnualMeans = applyReprojection(InterAnnualMeanOfAnnualMeans, resampling);
// InterAnnualMeanOfAnnualSDs = applyReprojection(InterAnnualMeanOfAnnualSDs, resampling);
// InterAnnualMeanOfAnnualCVs = applyReprojection(InterAnnualMeanOfAnnualCVs, resampling);
// InterAnnualMeanOfAnnualMaxima = applyReprojection(InterAnnualMeanOfAnnualMaxima, resampling);
// InterAnnualMeanOfAnnualMinima = applyReprojection(InterAnnualMeanOfAnnualMinima, resampling);
// InterAnnualMeanOfAnnualDMaxs    = applyReprojection(InterAnnualMeanOfAnnualDMaxs  , resampling);
// InterAnnualMeanOfAnnualCosOfDMaxs = applyReprojection(InterAnnualMeanOfAnnualCosOfDMaxs, resampling);
// InterAnnualMeanOfAnnualSinOfDMaxs = applyReprojection(InterAnnualMeanOfAnnualSinOfDMaxs, resampling);
// InterAnnualMeanOfAnnualDMaxModule = applyReprojection(InterAnnualMeanOfAnnualDMaxModule, resampling);
// InterAnnualMeanOfAnnualDMaxCos = applyReprojection(InterAnnualMeanOfAnnualDMaxCos, resampling);
// InterAnnualMeanOfAnnualDMaxSin = applyReprojection(InterAnnualMeanOfAnnualDMaxSin, resampling);
// InterAnnualMeanOfAnnualDMins = applyReprojection(InterAnnualMeanOfAnnualDMins, resampling);
// InterAnnualMeanOfAnnualCosOfDMins = applyReprojection(InterAnnualMeanOfAnnualCosOfDMins, resampling);
// InterAnnualSDOfAnnualMeans = applyReprojection(InterAnnualSDOfAnnualMeans, resampling);
// InterAnnualSDOfAnnualSDs = applyReprojection(InterAnnualSDOfAnnualSDs, resampling);
// InterAnnualSDOfAnnualCVs = applyReprojection(InterAnnualSDOfAnnualCVs, resampling);
// InterAnnualSDOfAnnualMaxima = applyReprojection(InterAnnualSDOfAnnualMaxima, resampling);
// InterAnnualSDOfAnnualMinima = applyReprojection(InterAnnualSDOfAnnualMinima, resampling);
// InterAnnualSDOfDMaxs = applyReprojection(InterAnnualSDOfDMaxs, resampling);
// InterAnnualSDOfSinOfDMaxs = applyReprojection(InterAnnualSDOfSinOfDMaxs, resampling);
// InterAnnualSDOfCosOfDMaxs = applyReprojection(InterAnnualSDOfCosOfDMaxs, resampling);
// InterAnnualSDOfDMins = applyReprojection(InterAnnualSDOfDMins, resampling);
// InterAnnualSDOfSinOfDMins = applyReprojection(InterAnnualSDOfSinOfDMins, resampling);
// InterAnnualSDOfCosOfDMins = applyReprojection(InterAnnualSDOfCosOfDMins, resampling);

InterAnnualMeanOfAnnualMeans = applyReprojection (InterAnnualMeanOfAnnualMeans, resampling);
InterAnnualMeanOfAnnualSDs = applyReprojection (InterAnnualMeanOfAnnualSDs, resampling);
InterAnnualMeanOfAnnualCVs = applyReprojection (InterAnnualMeanOfAnnualCVs, resampling);
InterAnnualMeanOfAnnualMaxima = applyReprojection (InterAnnualMeanOfAnnualMaxima, resampling);
InterAnnualMeanOfAnnualMinima = applyReprojection (InterAnnualMeanOfAnnualMinima, resampling);
DMaxSummaryOfPeriod = applyReprojection (DMaxSummaryOfPeriod, resampling);
MeanCosinesMax = applyReprojection (MeanCosinesMax, resampling);
MeanSinesMax = applyReprojection (MeanSinesMax, resampling);
DMaxSummaryOfPeriodModule = applyReprojection (DMaxSummaryOfPeriodModule, resampling);
DMaxSummaryOfPeriodSin = applyReprojection (DMaxSummaryOfPeriodSin, resampling);
DMaxSummaryOfPeriodCos = applyReprojection (DMaxSummaryOfPeriodCos, resampling);
DMinSummaryOfPeriod = applyReprojection (DMinSummaryOfPeriod, resampling);
MeanCosinesMin = applyReprojection (MeanCosinesMin, resampling);
MeanSinesMin = applyReprojection (MeanSinesMin, resampling);
DMinSummaryOfPeriodModule = applyReprojection (DMinSummaryOfPeriodModule, resampling);
DMinSummaryOfPeriodSin = applyReprojection (DMinSummaryOfPeriodSin, resampling);
DMinSummaryOfPeriodCos = applyReprojection (DMinSummaryOfPeriodCos, resampling);
InterAnnualSDOfAnnualMeans = applyReprojection (InterAnnualSDOfAnnualMeans, resampling);
InterAnnualSDOfAnnualSDs = applyReprojection (InterAnnualSDOfAnnualSDs, resampling);
InterAnnualSDOfAnnualCVs = applyReprojection (InterAnnualSDOfAnnualCVs, resampling);
InterAnnualSDOfAnnualMaxima = applyReprojection (InterAnnualSDOfAnnualMaxima, resampling);
InterAnnualSDOfAnnualMinima = applyReprojection (InterAnnualSDOfAnnualMinima, resampling);

// print('InterAnnualMeanOfAnnualMeans:',InterAnnualMeanOfAnnualMeans)

/////////////////////////////////////////////////////////////////////////////////
//////////Change type of data///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// print('Previo:',InterAnnualMeanOfAnnualMaxima);
// print('Previo, Dmin:',DMinSummaryOfPeriod);

InterAnnualMeanOfAnnualMeans = InterAnnualMeanOfAnnualMeans.clip(AOI).toFloat();
InterAnnualMeanOfAnnualSDs = InterAnnualMeanOfAnnualSDs.toFloat();
InterAnnualMeanOfAnnualCVs = InterAnnualMeanOfAnnualCVs.toFloat();
InterAnnualMeanOfAnnualMaxima = InterAnnualMeanOfAnnualMaxima.toFloat();
InterAnnualMeanOfAnnualMinima = InterAnnualMeanOfAnnualMinima.toFloat();
DMaxSummaryOfPeriod = DMaxSummaryOfPeriod.clip(AOI)//.toInt8();
// MeanCosinesMax = MeanCosinesMax.toFloat();
// MeanSinesMax = MeanSinesMax.toFloat();
// DMaxSummaryOfPeriodModule = DMaxSummaryOfPeriodModule.toFloat();
// DMaxSummaryOfPeriodSin = DMaxSummaryOfPeriodSin.toFloat();
// DMaxSummaryOfPeriodCos = DMaxSummaryOfPeriodCos.toFloat();
DMinSummaryOfPeriod = DMinSummaryOfPeriod//.toInt8();
// MeanCosinesMin = MeanCosinesMin.toFloat();
// MeanSinesMin = MeanSinesMin.toFloat();
// DMinSummaryOfPeriodModule = DMinSummaryOfPeriodModule.toFloat();
// DMinSummaryOfPeriodSin = DMinSummaryOfPeriodSin.toFloat();
// DMinSummaryOfPeriodCos = DMinSummaryOfPeriodCos.toFloat();
// InterAnnualSDOfAnnualMeans = InterAnnualSDOfAnnualMeans.toFloat();
// InterAnnualSDOfAnnualSDs = InterAnnualSDOfAnnualSDs.toFloat();
// InterAnnualSDOfAnnualCVs = InterAnnualSDOfAnnualCVs.toFloat();
// InterAnnualSDOfAnnualMaxima = InterAnnualSDOfAnnualMaxima.toFloat();
// InterAnnualSDOfAnnualMinima = InterAnnualSDOfAnnualMinima.toFloat();

// print('Post:', InterAnnualMeanOfAnnualMaxima);
print('Post Dmax:', DMinSummaryOfPeriod);
////////////////////////////////////
// 5.1) Each year EFA exportation //
////////////////////////////////////

var projection = Col.first().projection().getInfo();
var crs2 = projection.crs;
var crs_transform = projection.transform;

  // 5.1.1) Exportation of yearly Sums
  if (ExportationOfAnnualSums == 1) {
      var list = YearlySums.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Export.image.toDrive({
        image: image,
        description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Sum_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
        maxPixels: 1e13,
        folder: GDriveOutputImgFolder,
        scale: ResolOfExport,
        crs: crs2,
        crsTransform: crs_transform,
        region: AOI
        });
        }
  }
 
  // 5.1.2) Exportation of yearly Means                                  
  if (ExportationOfAnnualMeans == 1) {
    var list = YearlyMeans.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Export.image.toDrive({
        image: image,
        description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Median_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
        maxPixels: 1e13,
        folder: GDriveOutputImgFolder,
        scale: ResolOfExport,
        crs: crs2,
        crsTransform: crs_transform,
        region: AOI
        });
        }
  }
 
  // 5.1.3) Exportation of yearly SDs
  if (ExportationOfAnnualSDs == 1) {
      var list = YearlySDs.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'sSD__'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
        }
  }
 
  // 5.1.4) Exportation of yearly CVs
  if (ExportationOfAnnualCVs == 1) {
      var list = YearlyCVs.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'sCV__'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          crs: crs2,
          crsTransform: crs_transform,
          scale: ResolOfExport,
          region: AOI
          });
        }
  }  
 
  // 5.1.4) Exportation of yearly Maxima
  if (ExportationOfAnnualMaxima == 1) {
      var list = YearlyMaxima.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Max__'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
        }
  }
 
  // 5.1.5) Exportation of yearly Minima
  if (ExportationOfAnnualMinima == 1) {
      var list = YearlyMinima.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Min__'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
        }    
  }

  // 5.1.6) Exportation of yearly DMaxs
    if (ExportationOfAnnualDMaxs == 1) {
      if(ResolOfExport == NativeResol) {
      var list = MaxMonth.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMx__'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
          }
        if(ResolOfExport != NativeResol){
          print('You can only export DMax Images with the native resolution of the product. See code XXX');}    
        }    
  }
 
 
  // 5.1.6a) Exportation of yearly Sines of DMaxs
    if (ExportationOfAnnualSinOfDMaxs == 1) {
      if(ResolOfExport == NativeResol) {
      var list = MaxMonthSin.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMxS_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
          }
        if(ResolOfExport != NativeResol){
          print('You can only export DMax Images with the native resolution of the product. See code XXX');}    
        }    
  } 
 
   // 5.1.6b) Exportation of yearly Cosines of DMaxs
    if (ExportationOfAnnualCosOfDMaxs == 1) {
      if(ResolOfExport == NativeResol) {
      var list = MaxMonthCos.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMxC_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
          }
        if(ResolOfExport != NativeResol){
          print('You can only export DMax Images with the native resolution of the product. See code XXX');}    
        }    
  } 
 
  // 5.1.7) Exportation of yearly DMins
    if (ExportationOfAnnualDMins == 1) {
      if(ResolOfExport == NativeResol) {
      var list = MinMonth.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMi__'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
          }
        if(ResolOfExport != NativeResol){
          print('You can only export DMin Images with the native resolution of the product. See code XXX');}    
        }    
  }

  // 5.1.7a) Exportation of yearly Sines of DMins
    if (ExportationOfAnnualSinOfDMins == 1) {
      if(ResolOfExport == NativeResol) {
      var list = MinMonthSin.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMnS_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
          }
        if(ResolOfExport != NativeResol){
          print('You can only export DMin Images with the native resolution of the product. See code XXX');}    
        }    
  } 
 
   // 5.1.7b) Exportation of yearly Cosines of DMins
    if (ExportationOfAnnualCosOfDMins == 1) {
      if(ResolOfExport == NativeResol) {
      var list = MinMonthCos.toList(NumberYears, 0);
      for(var i = 0; i < NumberYears; i++) {
        var image = ee.Image(list.get(i));
        var name = image.get('year').getInfo();
        Export.image.toDrive({
          image: image,
          description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMnC_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
          maxPixels: 1e13,
          folder: GDriveOutputImgFolder,
          scale: ResolOfExport,
          crs: crs2,
          crsTransform: crs_transform,
          region: AOI
          });
          }
        if(ResolOfExport != NativeResol){
          print('You can only export DMin Images with the native resolution of the product. See code XXX');}    
        }    
  } 


  // 5.1.8) Exportation of percentile 5 Median                                  
  if (ExportationOfAnnualPercentile5 == 1) {
    var list = YearlyPercentile5.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Export.image.toDrive({
        image: image,
        description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Percentile5_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
        maxPixels: 1e13,
        folder: GDriveOutputImgFolder,
        scale: ResolOfExport,
        crs: crs2,
        crsTransform: crs_transform,
        region: AOI
        });
        }
  }
 
  // 5.1.9) Exportation of percentile 95 Median                                  
  if (ExportationOfAnnualPercentile95 == 1) {
    var list = YearlyPercentile95.toList(NumberYears, 0);
    for(var i = 0; i < NumberYears; i++) {
      var image = ee.Image(list.get(i));
      var name = image.get('year').getInfo();
      Export.image.toDrive({
        image: image,
        description : String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Percentile5_'+String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
        maxPixels: 1e13,
        folder: GDriveOutputImgFolder,
        scale: ResolOfExport,
        crs: crs2,
        crsTransform: crs_transform,
        region: AOI
        });
        }
  }
 
////////////////////////////////////////////////////
/// 5.2) EFA summaries of the period exportation ///
///////////////////////////////////////////////////

  // 5.2.1) Exportation of the InterAnnual Mean of the yearly Sums of the period //
  if (ExportationOfInterAnnualMeanOfAnnualSums == 1) {
    Export.image.toDrive({
      image: InterAnnualMeanOfAnnualSums,
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Sum__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
    });
  }
 
  // 5.2.2) Exportation of the InterAnnual Mean of the yearly Means of the period //
  if (ExportationOfInterAnnualMeanOfAnnualMeans == 1) {
    Export.image.toDrive({
      image: InterAnnualMeanOfAnnualMeans.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Median_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }
 
  // 5.2.3) Exportation of the InterAnnual Mean of the yearly sSDs of the period //
  if (ExportationOfInterAnnualMeanOfAnnualSDs == 1) {
    Export.image.toDrive({
      image: InterAnnualMeanOfAnnualSDs.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'sSD__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }  
 
  // 5.2.4) Exportation of the InterAnnual Mean of the yearly CVs of the period //
  if (ExportationOfInterAnnualMeanOfAnnualCVs == 1) {
    Export.image.toDrive({
      image: InterAnnualMeanOfAnnualCVs.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'sCV__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }  
 
  // 5.2.5) Exportation of the InterAnnual Mean of the yearly Maxima of the period //  
  if (ExportationOfInterAnnualMeanOfAnnualMaxima == 1) {
    Export.image.toDrive({
      image: InterAnnualMeanOfAnnualMaxima.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Max__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }
 
  // 5.2.6) Exportation of the InterAnnual Mean of the yearly Minima of the period //
  if (ExportationOfInterAnnualMeanOfAnnualMinima == 1) {
    Export.image.toDrive({
      image: InterAnnualMeanOfAnnualMinima.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Min__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }  
 
  // 5.2.X) Exportation of the InterAnnual Mean of the yearly Dmaxs of the period //
  if (ExportationOfInterAnnualMeanOfAnnualDMax == 1) {
    Export.image.toDrive({
      image: DMaxSummaryOfPeriod.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMx__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }

// 5.2.X) Exportation of the InterAnnual Mean of the yearly Cosines of the DMaxs of the period //
  if (ExportationOfInterAnnualMeanOfAnnualCosOfDMax == 1){
    Export.image.toDrive({
      image: MeanCosinesMax.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'MeanOfDMxC'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
} 

// 5.2.X) Exportation of the InterAnnual Mean of the yearly Sines of the DMaxs of the period //      
  if (ExportationOfInterAnnualMeanOfAnnualSinOfDMax == 1){
    Export.image.toDrive({
      image: MeanSinesMax.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'MeanOfDMxS'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

// 5.2.X) Exportation of the Module of the angle of Interannual mean of DMAX //      
  if (ExportationOfInterAnnualMeanOfDMaxModule == 1){
    Export.image.toDrive({
      image: DMaxSummaryOfPeriodModule.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMxModule'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

// 5.2.X) Exportation of the Sine of the angle of Interannual mean of DMAX //      
  if (ExportationOfInterAnnualMeanOfDMaxSin == 1){
    Export.image.toDrive({
      image: DMaxSummaryOfPeriodSin.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMxS'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

// 5.2.X) Exportation of the Cosine of the angle of Interannual mean of DMAX //      
  if (ExportationOfInterAnnualMeanOfDMaxCos == 1){
    Export.image.toDrive({
      image: DMaxSummaryOfPeriodCos.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMxC'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

print(DMinSummaryOfPeriod, "Check") 
  // 5.2.X) Exportation of the InterAnnual Mean of the yearly Dmins of the period //
  if (ExportationOfInterAnnualMeanOfAnnualDMin == 1) {
    Export.image.toDrive({
      image: DMinSummaryOfPeriod.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMi__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
    }

// 5.2.X) Exportation of the InterAnnual Mean of the yearly Cosines of the DMins of the period //
  if (ExportationOfInterAnnualMeanOfAnnualCosOfDMin == 1){
    Export.image.toDrive({
      image: MeanCosinesMin.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'MeanOfDMiC'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
} 

// 5.2.X) Exportation of the InterAnnual Mean of the yearly Sines of the Dmins of the period //      
  if (ExportationOfInterAnnualMeanOfAnnualSinOfDMin == 1){
    Export.image.toDrive({
      image: MeanSinesMin.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'MeanOfDMiS'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

// 5.2.X) Exportation of the Module of the angle of Interannual mean of DMIN //      
  if (ExportationOfInterAnnualMeanOfDMinModule == 1){
    Export.image.toDrive({
      image: DMinSummaryOfPeriodModule.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMiModule'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

// 5.2.X) Exportation of the Sine of the angle of Interannual mean of DMIN //      
  if (ExportationOfInterAnnualMeanOfDMinSin == 1){
    Export.image.toDrive({
      image: DMinSummaryOfPeriodSin.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMiS'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

// 5.2.X) Exportation of the Cosine of the angle of Interannual mean of DMIN //      
  if (ExportationOfInterAnnualMeanOfDMinCos == 1){
    Export.image.toDrive({
      image: DMinSummaryOfPeriodCos.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMiC'+'_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
}

 
   // 5.2.X) Exportation of the Sums SD of the period //
  if (ExportationOfInterAnnualSDOfAnnualSums == 1) {
    Export.image.toDrive({
      image: InterAnnualSDOfAnnualSums.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Sum__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSD_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }
 
  // 5.2.X) Exportation of the Means SD of the period //
  if (ExportationOfInterAnnualSDOfAnnualMeans == 1) {
    Export.image.toDrive({
      image: InterAnnualSDOfAnnualMeans.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Mean_'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSD_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }
 
  // 5.2.X) Exportation of the SDs SD of the period //
  if (ExportationOfInterAnnualSDOfAnnualSDs == 1) {
    Export.image.toDrive({
      image: InterAnnualSDOfAnnualSDs.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'sSD__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSD_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }  
 
  // 5.2.X) Exportation of the CVs SD of the period //
  if (ExportationOfInterAnnualSDOfAnnualCVs == 1) {
    Export.image.toDrive({
      image: InterAnnualSDOfAnnualCVs.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'sCV__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSD_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }  
 
  // 5.2.X) Exportation of the Maxima SD of the period //  
  if (ExportationOfInterAnnualSDOfAnnualMaxima == 1) {
    Export.image.toDrive({
      image: InterAnnualSDOfAnnualMaxima.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Max__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSD_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }
 
  // 5.2.X) Exportation of the Minima SD of the period //
  if (ExportationOfInterAnnualSDOfAnnualMinima == 1) {
    Export.image.toDrive({
      image: InterAnnualSDOfAnnualMinima.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Min__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSD_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }     
   
  // 5.2.X) Exportation median of percentile 5 of the period //
  if (ExportationOfInterAnnualMedianPercentile5 == 1) {
    Export.image.toDrive({
      image: InterAnnualMedianPercentile5.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Percentile5__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }     
  
  
  // 5.2.X) Exportation median of percentile 95 of the period //
  if (ExportationOfInterAnnualMedianPercentile95 == 1) {
    Export.image.toDrive({
      image: InterAnnualMedianPercentile95.clip(AOI),
      description: String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Percentile95__'+String(FirstYear)+'-'+String(LastYear)+'_Season'+String(FirstMonth)+'-'+String(LastMonth)+'_InterAnnualSMedian_'+String(crs)+'_Pixel'+String(RoundResol),
      maxPixels: 1e13,
      folder: GDriveOutputImgFolder,
      scale: ResolOfExport,
      crs: crs2,
      crsTransform: crs_transform,
      region: AOI
    });
  }     
   
//////////////////////////////////////////////////////////   
//////////////////////////////////////////////////////////  
// 6. Extraction of Raster Values from Polygons to Tables    
//////////////////////////////////////////////////////////   
//////////////////////////////////////////////////////////   
if (ExtractionOfValuesAsTables == 1) {

// 6.0.1) Extraction of Yearly Means to Table //
if (ExtractionOfAnnualMeans == 1) {
  var list = YearlyMeans.toList(NumberYears, 0);
  for(var i = 0; i < NumberYears; i++) {
    var image = ee.Image(list.get(i));
    var name = image.get('year').getInfo();
    var ExtractYearlyMeans = image.reduceRegions({
      reducer: ee.Reducer.mean(),
      collection: Shape, //Fusion table
      scale: NativeResol
    });
    Export.table.toDrive({
    collection: ExtractYearlyMeans, 
    description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Mean_'+
    String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
    fileFormat: 'CSV',
    folder: GDriveOutputImgFolder
    });
  }
}

// 6.0.2) Extraction of Yearly SDs to Table //
if (ExtractionOfAnnualSDs == 1) {
  var list = YearlySDs.toList(NumberYears, 0);
  for(var i = 0; i < NumberYears; i++) {
    var image = ee.Image(list.get(i));
    var name = image.get('year').getInfo();
    var ExtractYearlySDs = image.reduceRegions({
      reducer: ee.Reducer.mean(),
      collection: Shape, //Fusion table
      scale: NativeResol
    });
    Export.table.toDrive({
    collection: ExtractYearlySDs, 
    description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'SDs_'+
    String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
    fileFormat: 'CSV',
    folder: GDriveOutputImgFolder
    });
  }
}

// 6.0.3) Extraction of Yearly Maxima to Table //
if (ExtractionOfAnnualMaxima == 1) {
  var list = YearlyMaxima.toList(NumberYears, 0);
  for(var i = 0; i < NumberYears; i++) {
    var image = ee.Image(list.get(i));
    var name = image.get('year').getInfo();
    var ExtractYearlyMaxima = image.reduceRegions({
      reducer: ee.Reducer.mean(),
      collection: Shape, //Fusion table
      scale: NativeResol
    });
    Export.table.toDrive({
    collection: ExtractYearlyMaxima, 
    description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Max_'+
    String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
    fileFormat: 'CSV',
    folder: GDriveOutputImgFolder
    });
  }
}

// 6.0.4) Extraction of Yearly Minima to Table //
if (ExtractionOfAnnualMinima == 1) {
  var list = YearlyMinima.toList(NumberYears, 0);
  for(var i = 0; i < NumberYears; i++) {
    var image = ee.Image(list.get(i));
    var name = image.get('year').getInfo();
    var ExtractYearlyMinima = image.reduceRegions({
      reducer: ee.Reducer.mean(),
      collection: Shape, //Fusion table
      scale: NativeResol
    });
    Export.table.toDrive({
    collection: ExtractYearlyMinima, 
    description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Min_'+
    String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
    fileFormat: 'CSV',
    folder: GDriveOutputImgFolder
    });
  }
}

// 6.0.5) Extraction of Yearly DMAX to Table //
if (ExtractionOfAnnualDMaxs == 1) {
  var list = YearlyMonthMax.toList(NumberYears, 0);
  for(var i = 0; i < NumberYears; i++) {
    var AnnualMonthMax = ee.Image(list.get(i));
    var name = AnnualMonthMax.get('year').getInfo();

        // Month of max in radians
          var rad = ((2*Math.PI)/12);
          var AnnualMonthAsRadiansMax = AnnualMonthMax.multiply(rad);
        
        // Computation of Cosines
          var AnnualCosineMax = AnnualMonthAsRadiansMax.cos();

        // Computation of Sines
          var AnnualSineMax = AnnualMonthAsRadiansMax.sin();

// Para aplicarlo a cada celda/polígono del shape
// DMax //

// Estas dos variables para calcular el MMAX más tarde
  // Sines //
var AnnualExtractSine1Max = AnnualSineMax.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
  // Cosines //
var AnnualExtractCosine1Max = AnnualCosineMax.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
var reducer = ee.Reducer.toList();
// Columnas de senos y cosenos medios // Aquí se pierde la ID de los elementos // 
var AnnualSinesMeansMax = AnnualExtractSine1Max.reduceColumns(reducer, ['mean']); // Seleccionar de la FeatureCollection la columna de los senos
// print('SinesMeans', SinesMeans);
var AnnualCosinesMeansMax = AnnualExtractCosine1Max.reduceColumns(reducer, ['mean']); // Seleccionar de la FeatureCollection la columna de los cosenos
// print('CosinesMeans', CosinesMeans);

// Conversión a Array para poder hacer la arcotangente
  var AnnualSSMax = ee.Array(AnnualSinesMeansMax.get('list')); // Conversión a lista de la columna de los senos
  var AnnualCCMax = ee.Array(AnnualCosinesMeansMax.get('list')); // Conversión a lista de la columna de los cosenos  
  // print('SS', SS);
   // print('CC', CC);
  var AnnualatanMax = AnnualSSMax.atan2(AnnualCCMax); // Arcotangente de senos y Cosenos
  //print('atan', atan);

// Conversión de atan a meses
// Esta columna tiene el MMAX final
      var AnnualxxMax = ((AnnualatanMax.lt(0)).multiply(AnnualatanMax.add(2*(Math.PI)))).add((AnnualatanMax.gt(0)).multiply(AnnualatanMax));
      var AnnualMonth_aMax = (AnnualxxMax.multiply(12)); 
      var AnnualMonthOfMaxFinal = (AnnualMonth_aMax.divide((2*(Math.PI))));   //Esta es la columna en la que está el DMax final. 
      var AnnualMonthOfMaxFinal = AnnualMonthOfMaxFinal.toList();
    
// Creación de lista con la ID de los elementos //
// Obtener el ID de los polígonos      
//print('ExtractCosines1', ExtractCosines1.limit(10));
var AnnualIDs = ee.FeatureCollection(AnnualExtractCosine1Max.filterMetadata('mean', 'not_greater_than', 2));
var AnnualIDs = AnnualIDs.reduceColumns(reducer, [IdFieldName]);
// print('IDs', IDs)
var AnnualIDs = ee.Array(AnnualIDs.get('list'));
var AnnualIDs = AnnualIDs.toList(); // Columna con IDs de los polígonos
// print('MonthOfMaxFinal', MonthOfMaxFinal);

// Unión de IDs de polígonos con el respectivo MMAX
var AnnualXXMax = AnnualIDs.zip(AnnualMonthOfMaxFinal);
// var ExtractCosines1 = MeanCosines.toList();
//print('XX', XX)
var AnnualSSSMax = ee.Array(AnnualSinesMeansMax.get('list'));
var AnnualSSSMax = AnnualSSSMax.toList();
//print('SSS', SSS)
var AnnualCCCMax = ee.Array(AnnualCosinesMeansMax.get('list'));
var AnnualCCCMax = AnnualCCCMax.toList();
//print('CCC', CCC)
var AnnualXXXMax = AnnualXXMax.zip(AnnualSSSMax);
var AnnualXXXMax = AnnualXXXMax.zip(AnnualCCCMax);
// print('XXX', XXX); // Esto no lo exporta porque no es una FeatureCollection

var ExtractYearlyDMAX = ee.FeatureCollection(AnnualXXXMax.map(function(list) {
    var xxMax = ee.List(list);
    var dict = {
        col1: xxMax,
    };
    return ee.Feature(null, dict);
  }));


    Export.table.toDrive({
    collection: ExtractYearlyDMAX, 
    description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'DMAX_DMaS_DMaC_'+
    String(name)+'_'+String(crs)+'_Pixel'+String(RoundResol),
    fileFormat: 'CSV',
    folder: GDriveOutputImgFolder
    });
  }
}









///////////////////////////////////////////////////////////////////////////
////////////////////// EXTRACTION OF INTERANNUAL SUMMARIES TO TABLE  //////
///////////////////////////////////////////////////////////////////////////

// 6.1) Extraction of Sums to Table //
/*if (ExtractionOfInterAnnualMeanOfAnnualSums == 1) {
var ExtractSums = InterAnnualMeanOfAnnualSums.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
Export.table.toDrive({
  collection: ExtractSums, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Sum__'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder}); 
}*/

// 6.2) Extraction of Means to Table //
if(ExtractionOfInterAnnualMeanOfAnnualMeans == 1) {
var ExtractMeans = InterAnnualMeanOfAnnualMeans.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape, //Fusion table
  scale: NativeResol
});
Export.table.toDrive({
  collection: ExtractMeans, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Mean_'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder}); 
}

// 6.3) Extraction of SDs to Table //
if(ExtractionOfInterAnnualMeanOfAnnualSDs == 1) {
var ExtractSDs = InterAnnualMeanOfAnnualSDs.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
Export.table.toDrive({
  collection: ExtractSDs, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'SDs__'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder}); 
}

// 6.4) Extraction of Max to Table //
if(ExtractionOfInterAnnualMeanOfAnnualMaxima == 1) {
var ExtractMaxs = InterAnnualMeanOfAnnualMaxima.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
Export.table.toDrive({
  collection: ExtractMaxs, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Max__'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder});  
}

// 6.5) Extraction of Min to Table //
if(ExtractionOfInterAnnualMeanOfAnnualMinima == 1) {
var ExtractMins = InterAnnualMeanOfAnnualMinima.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
Export.table.toDrive({
  collection: ExtractMins, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'Min__'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder});  
}


// 6.6) Extraction of DMax DMaxSin DMaxCos to Table //
if(ExtractionOfInterAnnualMeanOfAnnualDMaxs == 1) {
  // Mean of the DMaxs of the period
  var MaxMonth = ee.ImageCollection(TimeFrame
      .map(function(y) {
        var start = ee.Date.fromYMD(y, 1, 1);
        var step = start.advance(1, 'year');
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var MonthlyVariableMax = months.map(function(m) {
          // Filter to 1 month.
          var MonthVariableMax = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).mean();
          // add month band for DMax
          return  MonthVariableMax.addBands(ee.Image.constant(m).select([0],['month']).int8());
          });
        var MonthlyVariableMaxColl = ee.ImageCollection(MonthlyVariableMax);
        var Max = MonthlyVariableMaxColl.qualityMosaic(SelectedVariableName);
        var DMax = Max.select(['month']);
        return DMax.set('year', y);
        }));
  
        // Month of max in radians
          var MonthsAsRadiansMax = MaxMonth.map(function(image){
            var rad = ((2*Math.PI)/12);
            return image.multiply(rad);
          });
        
        // Computation of Cosines
          var CosinesMax = MonthsAsRadiansMax.map(function(image){
            return image.cos();
          });
          var SumCosinesMax = CosinesMax.reduce(ee.Reducer.sum());
          var MeanCosinesMax = SumCosinesMax.divide(NumberYears); //División de la suma de cosenos por el número de imágenes/años
        
        // Computation of Sines
          var SinesMax = MonthsAsRadiansMax.map(function(image){
            return image.sin();
          });
          var SumSinesMax = SinesMax.reduce(ee.Reducer.sum());
          var MeanSinesMax = SumSinesMax.divide(NumberYears);

// Para aplicarlo a cada celda/polígono del shape
// DMax //

// Estas dos variables para calcular el MMAX más tarde
  // Sines //
var ExtractSines1Max = MeanSinesMax.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
  // Cosines //
var ExtractCosines1Max = MeanCosinesMax.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});
var reducer = ee.Reducer.toList();

// Columnas de senos y cosenos medios // Aquí se pierde la ID de los elementos // 
var SinesMeansMax = ExtractSines1Max.reduceColumns(reducer, ['mean']); // Seleccionar de la FeatureCollection la columna de los senos
// print('SinesMeans', SinesMeans);
var CosinesMeansMax = ExtractCosines1Max.reduceColumns(reducer, ['mean']); // Seleccionar de la FeatureCollection la columna de los cosenos
// print('CosinesMeans', CosinesMeans);

// Conversión a Array para poder hacer la arcotangente
  var SSMax = ee.Array(SinesMeansMax.get('list')); // Conversión a lista de la columna de los senos
  var CCMax = ee.Array(CosinesMeansMax.get('list')); // Conversión a lista de la columna de los cosenos  
  // print('SS', SS);
   // print('CC', CC);
  var atanMax = SSMax.atan2(CCMax); // Arcotangente de senos y Cosenos
  //print('atan', atan);

// Conversión de atan a meses
// Esta columna tiene el MMAX final
      var xxMax = ((atanMax.lt(0)).multiply(atanMax.add(2*(Math.PI)))).add((atanMax.gt(0)).multiply(atanMax));
      var Month_aMax = (xxMax.multiply(12)); 
      var MonthOfMaxFinal = (Month_aMax.divide((2*(Math.PI))));   //Esta es la columna en la que está el DMax final. 
      var MonthOfMaxFinal = MonthOfMaxFinal.toList();
    
// Creación de lista con la ID de los elementos //
// Obtener el ID de los polígonos      
//print('ExtractCosines1', ExtractCosines1.limit(10));
var IDs = ee.FeatureCollection(ExtractCosines1Max.filterMetadata('mean', 'not_greater_than', 2));
var IDs = IDs.reduceColumns(reducer, [IdFieldName]);
// print('IDs', IDs)
var IDs = ee.Array(IDs.get('list'));
var IDs = IDs.toList(); // Columna con IDs de los polígonos
// print('MonthOfMaxFinal', MonthOfMaxFinal);

// Unión de IDs de polígonos con el respectivo MMAX
var XXMax = IDs.zip(MonthOfMaxFinal);
// var ExtractCosines1 = MeanCosines.toList();
//print('XX', XX)
var SSSMax = ee.Array(SinesMeansMax.get('list'));
var SSSMax = SSSMax.toList();
//print('SSS', SSS)
var CCCMax = ee.Array(CosinesMeansMax.get('list'));
var CCCMax = CCCMax.toList();
//print('CCC', CCC)
var XXXMax = XXMax.zip(SSSMax);
var XXXMax = XXXMax.zip(CCCMax);
// print('XXX', XXX); // Esto no lo exporta porque no es una FeatureCollection

var DMaxTable = ee.FeatureCollection(XXXMax.map(function(list) {
    var xxMax = ee.List(list);
    var dict = {
        col1: xxMax,
    };
    return ee.Feature(null, dict);
  }));
//  print('DMaxTable', DMaxTable.limit(10))
Export.table.toDrive({
  collection: DMaxTable, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'MMaxSinCos_'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder});
}


// 6.7) Extraction of DMin DMinSin DMinCos to Table //
if(ExtractionOfInterAnnualMeanOfAnnualDMins == 1) {
  // Mean of the DMins of the period
  var MinMonth = ee.ImageCollection(TimeFrame
      .map(function(y) {
        var start = ee.Date.fromYMD(y, 1, 1);
        var step = start.advance(1, 'year');
        var months = ee.List.sequence(FirstMonth, LastMonth);
        var Variable = SelectedVariable.filterDate(start, step);
        var MonthlyVariableMin = months.map(function(m) {
          // Filter to 1 month.
          var MonthVariableMin = Variable.filter(ee.Filter.calendarRange(m, m, 'month')).min();
          var Evi_menMin = MonthVariableMin.multiply(-1);
          return  Evi_menMin.addBands(ee.Image.constant(m).select([0],['month']).int8());
          });
        var MonthlyVariableMinColl = ee.ImageCollection(MonthlyVariableMin);
        var Min = MonthlyVariableMinColl.qualityMosaic(SelectedVariableName);
        var DMin = Min.select(['month']);
        return DMin.set('year', y);
        }));
  
        // Month of Min in radians
          var MonthsAsRadiansMin = MinMonth.map(function(image){
            var rad = ((2*Math.PI)/12);
            return image.multiply(rad);
          });
        
        // Computation of Cosines
          var CosinesMin = MonthsAsRadiansMin.map(function(image){
            return image.cos();
          });
          var SumCosinesMin = CosinesMin.reduce(ee.Reducer.sum());
          var MeanCosinesMin = SumCosinesMin.divide(NumberYears); //División de la suma de cosenos por el número de imágenes/años
        
        // Computation of Sines
          var SinesMin = MonthsAsRadiansMin.map(function(image){
            return image.sin();
          });
          var SumSinesMin = SinesMin.reduce(ee.Reducer.sum());
          var MeanSinesMin = SumSinesMin.divide(NumberYears);


  // Sines //
var ExtractSines1Min = MeanSinesMin.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});

  // Cosines //
var ExtractCosines1Min = MeanCosinesMin.reduceRegions({
  reducer: ee.Reducer.mean(),
  collection: Shape,
  scale: NativeResol
});

var reducer = ee.Reducer.toList();

// Columnas de senos y cosenos medios // Aquí se pierde la ID de los elementos // 

var SinesMeansMin = ExtractSines1Min.reduceColumns(reducer, ['mean']); // Seleccionar de la FeatureCollection la columna de los senos
// print('SinesMeans', SinesMeans);

var CosinesMeansMin = ExtractCosines1Min.reduceColumns(reducer, ['mean']); // Seleccionar de la FeatureCollection la columna de los cosenos
// print('CosinesMeans', CosinesMeans);

// Conversión a Array para poder hacer la arcotangente
  var SSMin = ee.Array(SinesMeansMin.get('list')); // Conversión a lista de la columna de los senos
  var CCMin = ee.Array(CosinesMeansMin.get('list')); // Conversión a lista de la columna de los cosenos  
  // print('SS', SS);
   // print('CC', CC);
  var atanMin = SSMin.atan2(CCMin); // Arcotangente de senos y Cosenos
  //print('atan', atan);

// Conversión de atan a meses
// Esta columna tiene el MMin final
      var xxMin = ((atanMin.lt(0)).multiply(atanMin.add(2*(Math.PI)))).add((atanMin.gt(0)).multiply(atanMin));
      var Month_aMin = (xxMin.multiply(12)); 
      var MonthOfMinFinal = (Month_aMin.divide((2*(Math.PI))));   //Esta es la columna en la que está el DMin final. 
      var MonthOfMinFinal = MonthOfMinFinal.toList();

// Creación de lista con la ID de los elementos //
// Obtener el ID de los polígonos      
var IDs = ee.FeatureCollection(ExtractCosines1Min.filterMetadata('mean', 'not_greater_than', 2));
var IDs = IDs.reduceColumns(reducer, [IdFieldName]);
// print('IDs', IDs)
var IDs = ee.Array(IDs.get('list'));
var IDs = IDs.toList(); // Columna con IDs de los polígonos
// print('MonthOfMinFinal', MonthOfMinFinal);

// Unión de IDs de polígonos con el respectivo MMin
var XXMin = IDs.zip(MonthOfMinFinal);
// var ExtractCosines1 = MeanCosines.toList();
var SSSMin = ee.Array(SinesMeansMin.get('list'));
var SSSMin = SSSMin.toList();
var CCCMin = ee.Array(CosinesMeansMin.get('list'));
var CCCMin = CCCMin.toList();
var XXXMin = XXMin.zip(SSSMin);
var XXXMin = XXXMin.zip(CCCMin);
// print('XXX', XXX); // Esto no lo exporta porque no es una FeatureCollection

var DMinTable = ee.FeatureCollection(XXXMin.map(function(list) {
  var xxMin = ee.List(list);
  var dict = {
      col1: xxMin,
  };
  return ee.Feature(null, dict);
  }));
Export.table.toDrive({
  collection: DMinTable, 
  description: String(TableSufix)+String(Variable)+String(collectionOfData)+'_'+String(product)+'_'+'MMinSinCos_'+
  String(FirstYear)+'-'+String(LastYear)+'_InterAnnualMean_'+String(crs)+'_Pixel'+String(RoundResol), 
  fileFormat: 'CSV',
  folder: GDriveOutputTableFolder});
}

}



//   METADATA
/*

INDEX
1.- Readme version
2.- Brief description of content
3.- Contact for further details
4.- Filename structure
5.- Pixel sizes


1.- Readme version:
  19 April 2017 by Domingo Alcaraz-Segura
  18 July 2017 by Domingo Alcaraz-Segura
  16 December 2019 Domingo Alcaraz-Segura

2.- Brief description of content
	This folder contains the EVI, LST, Albedo, Precipitation, BAI, NDWI, NDSI, GPP, NPP, Attributes (EFAs) for the defined period (e.g. 2001-2019). 
	Yearly attributes can be retrieved.
	It usually has the interannual summaries of the attributes for the global period.
	All images are global if not specified for a particular region.


3.- Contact for further details
Domingo Alcaraz-Segura dalcaraz@ugr.es University of Granada (Spain)
Javier Blanco Sacristán j.blanco.sacristan@gmail.com CRN (Italy)


4.- Filename structure
Units and product user guides
EVI_: Enhanced Vegetation Index. 
006: Dimensionless, Scale 0.0001
PixelValue * 0.0001 = PixelValueInEVI(-1 to +1)
Phenology: DMax & DMin (1-12 month of year). Sin & Cos (-1 to +1)
https://lpdaac.usgs.gov/dataset_discovery/modis/modis_products_table/mod13q1_v006 
Alb_: Average between Daytime Black-Sky (Direct radiation) Shortwave Albedo and White-Sky (Diffuse radiation) Shortwave Albedo. 
0.05: Dimensionless, Scale 0.0010. 
PixelValue * 0.0010 = PixelValueInAlbedo(0 to +1)
Phenology: DMax & DMin (1-12 month of year). Sin & Cos (-1 to +1)
https://lpdaac.usgs.gov/dataset_discovery/modis/modis_products_table/mcd43b3 
LST_: LST_Day_1km: Daytime Land Surface Temperatures (K), 
0.06: Kelvin, Scale 0.02
PixelValue * 0.02 - 273.15 = PixelValueInCelsius (for Mean, Max and Min)
PixelValue * 0.02 = PixelValueInCelsius (for SD)
Phenology: DMax & DMin (1-12 month of year). Sin & Cos (-1 to +1)
https://icess.eri.ucsb.edu/modis/LstUsrGuide/usrguide.html 
Pre_: Precipitation. Units: mm/pendad (5 days)
Each asset spans a pentad. Each of first 5 pentads in a month have 5 days. The last pentad contains all the days from the 26th to the end of the month. 
E.g. Mean Annual Prec:
Value mm/pentad * 6 pentads/month * 12 months/year = Value mm/Year
Phenology: DMax & DMin (1-12 month of year). Sin & Cos (-1 to +1)
	http://chg.geog.ucsb.edu/data/chirps/ 
NDV: Normalized Difference Vegetation Index.  
006: Dimensionless, Scale 0.0001
PixelValue * 0.0001 = PixelValueInNDVI(-1 to +1)
Phenology: DMax & DMin (1-12 month of year). Sin & Cos (-1 to +1)
https://lpdaac.usgs.gov/dataset_discovery/modis/modis_products_table/mod13q1_v006 


Filenames structure
Annual Image:
Selected Variable
EVI_: Enhanced Vegetation Index
Alb_: Albedo
LST_: Land Surface Temperature
Pre_: Precipitation
NDV: Normalized Difference Vegetation Index
Selected Collection
C005: collection 005
C006: collection 006
Product:
MOD13Q1: MODIS/MOD13Q1 (EVI and NDVI indices)
MCD43B3: MODIS/MCD43B3 (Albedo)
MOD11A2: MODIS/MOD11A2 (Land Surface Temperature)
CHIRPS_: UCSB-CHG/CHIRPS/PENTAD (CHIRPS precipitation data)
Functional Attribute
Mean: mean
sCV_: seasonal coefficient of variation
sSD_: seasonal standard deviation
Max_: maximum
Min_: minimum
DMx_: date of maximum
DMxS: sine of the date of maximum 
DMxC: cosine of the date of maximum 
DMi_: date of minimum
DMiS: sine of the date of minimum 
DMiC: cosine of the date of minimum 
Year: year of the image
Reference system: EPSG: . . . . . .
Pixel: pixel size in meters	

[Each element from the name has 4 string characters. When the element does not have 4 string characters, a “_” is used to complete it.]

Examples: 
- Evi_C006_MOD13Q1_Mean_2001_SR-ORG:6974_Pixel231 → EVI Annual Mean for the year 2001 (mean of the 23 EVI images in the year 2001), using the collection MODIS/006/MOD13Q1 with a pixel size of 231m
- Pre_XXXX_CHIRPS__sCV_2015_EPSG:4326_Pixel231 → Seasonal Coefficient of Variation of the 2015 Precipitation, using the collection UCSB-CHG/CHIRPS/PENTAD  with a pixel size of 231m

InterAnnual Image:
Selected Variable
EVI_: Enhanced Vegetation Index
Alb_: Albedo
LST_: Land Surface Temperature
Pre_: Precipitation
NDV_: Normalized Difference Vegetation Index
Selected Collection
C005: MODIS/005/MOD13Q1 
C006: MODIS/006/MOD13Q1 
Product:
MOD13Q1: MODIS/MOD13Q1 (EVI and NDVI indices)
MCD43B3: MODIS/MCD43B3 (Albedo)
MOD11A2: MODIS/MOD11A2 (Land Surface Temperature)
PENTAD: UCSB-CHG/CHIRPS/PENTAD (CHIRPS precipitation data)
Functional Attribute
Mean: mean
sCV_: seasonal coefficient of variation
sSD_: seasonal standard deviation
Max_: maximum
Min_: minimum
DMx_: date of maximum
DMxS: sine of the date of maximum 
DMxC: cosine of the date of maximum 
DMi_: date of minimum
DMiS: sine of the date of minimum 
DMiC: cosine of the date of minimum 
First Year of the Period
Last Year of the Period
InterAnnual + Attribute
Attribute can be any from point 2
Reference system: EPSG: . . . . . .
Pixel: pixel size in meters	

[Each element from the name (except number 6) has 4 string characters. When the element does not have 4 string characters, a “_” is used to complete it.]

	Examples:
- Evi_C006_MOD13Q1_Mean_2001-2016_InterannualMean_SR-ORG:6974
Pixel231 → Interannual mean of the EVI mean of the 2001-2016 period with a pixel size of 231m
- LST_C005_MOD11A2_Mean_2001-2016_InterannualsSD_SR-ORG:6974
Pixel231 → Interannual Standard Deviation of the LST mean of the 2001-2016 period with a pixel size of 231m


5.- PIXEL SIZES
-----------
NDVI and EVI: MOD13Q1 -> pixel 230 m
MODIS/006/MOD11A2 LSTemperature 1 km
MODIS/006/MCD43A3 Albedo 500 m
UCSB-CHG/CHIRPS/PENTAD PRECIPITATION CHIRPS 0.05DEG 5 km 
MODIS/NTSG/MOD16A2/105 EVAPOTRANSPIRATION MODIS 1 km
MODIS/MCD43A4_006_NDWI NDWI Normalized Difference Water Index 500 m
MODIS/MCD43A4_006_NDSI NDSI Normalized Difference Snow Index 500 km
MODIS/MCD43A4_006_BAI BAI Burned Area Index 500 m
MODIS/006/MOD17A2H GPP 500 m
MODIS/006/MOD17A3H NPP 500 m

*/