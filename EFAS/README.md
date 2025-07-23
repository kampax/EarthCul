# EFAS - Ecological Functional Attributes

This module calculates Ecological Functional Attributes (EFAs) from multi-temporal satellite imagery to quantify ecosystem functioning patterns across 8 Spanish National Parks in the EarthCul project.

## Overview

Ecological Functional Attributes (EFAs) are temporal descriptors of ecosystem functioning derived from satellite-based vegetation indices and biophysical variables. EFAs characterize the seasonal and interannual patterns of ecosystem processes, providing insights into ecosystem productivity, phenology, and stability.

## Theoretical Framework

EFAs are based on the methodology developed by Alcaraz-Segura et al. (2006), which describes ecosystem functioning through temporal statistics of remotely sensed variables:

- **Annual Descriptors**: Mean, Standard Deviation, Maximum, Minimum, Coefficient of Variation
- **Phenological Timing**: Date of Maximum (DMax), Date of Minimum (DMin)  
- **Interannual Variability**: Multi-year summaries of annual descriptors
- **Percentile-based Metrics**: 5th and 95th percentiles for extreme value analysis

## Data Sources

### Primary Satellite Collections
- **Landsat 8 Collection**: Surface reflectance and thermal data
- **Sentinel-2**: Surface reflectance collection


### Calculated Indices
- **NDVI**: Normalized Difference Vegetation Index (vegetation greenness)
- **EVI**: Enhanced Vegetation Index (improved vegetation signal)
- **LST**: Land Surface Temperature (thermal conditions)
- **NDWI**: Normalized Difference Water Index (water content)
- **NDSI**: Normalized Difference Snow Index (snow cover)
- **NBR**: Normalized Burn Ratio (fire effects)
- **LSWI**: Land Surface Water Index (surface moisture)
- **Albedo**: Surface reflectance (energy balance)



## Processing Workflow

### Phase 1: Data Acquisition and Preprocessing (`GEE code/EFAS code.js`)

**Google Earth Engine Processing**:
1. **Satellite Data Collection**: Download Landsat 8/Sentinel-2 imagery for 2018-2022
2. **Index Calculation**: Compute 8 biophysical indices per image
3. **Temporal Filtering**: Apply cloud masking and temporal constraints
4. **Annual EFAs Calculation**: 
   - Mean (Median): Central tendency
   - Standard Deviation: Temporal variability  
   - Maximum/Minimum: Extreme values
   - Coefficient of Variation: Relative variability
   - DMax/DMin: Phenological timing
   - Percentiles: 5th and 95th percentiles

5. **Interannual Summaries**: Multi-year statistics of annual EFAs
6. **Export**: Generate raster outputs for each park and metric

### Phase 2: Spatial Resampling (`1) Resampling LANDSAT.ipynb`)

**Objective**: Harmonize spatial resolution between different sensors
- **Input**: Raw Landsat 8 thermal data (100m resolution)
- **Reference**: Sentinel-2 resolution (10m)  
- **Method**: Bilinear resampling using rasterio
- **Output**: Resampled rasters matching reference resolution and extent

### Phase 3: Coordinate System Alignment (`3) Align and clip layers.ipynb`)

**Purpose**: Standardize coordinate reference systems for each park
- **Input**: EFAs rasters in various projections
- **Processing**: GDAL-based reprojection to park-specific UTM zones:
  - Aigüestortes: EPSG:32631 (UTM 31N)
  - Ordesa: EPSG:32630 (UTM 30N)
  - Peneda: EPSG:32629 (UTM 29N)
  - Guadarrama: EPSG:32630 (UTM 30N)
  - Picos: EPSG:32629 (UTM 29N)
  - SierraNieves: EPSG:32630 (UTM 30N)
  - SierraNevada: EPSG:32630 (UTM 30N)
  - Teide: EPSG:32628 (UTM 28N)
- **Output**: Park-specific reprojected raster collections

### Phase 4: Zonal Statistics (`2) Spatial summarize EFAs.R`)

**Objective**: Calculate segment-based statistics for spatial analysis
- **Input**: 
  - Reprojected EFAs rasters
  - 100m × 100m analysis grid per park
- **Processing**: 
  - Grid resampling to match raster properties
  - Zonal statistics calculation (median, standard deviation)
  - Segment-based aggregation across seasonal mosaics
- **Output**: Per-segment metrics as individual GeoTIFF layers
- **Memory Requirements**: ~8.5 GB RAM for processing



## Technical Specifications

### Temporal Coverage
- **Period**: 2018-2022 (5 years)
- **Temporal Resolution**: 16-day composites (Landsat) / 5-day (Sentinel-2)
- **Seasonal Coverage**: Full year (months 1-12)

### Spatial Properties
- **Original Resolution**: 30m (Landsat), 10m (Sentinel-2)
- **Analysis Grid**: 100m × 100m regular grid
- **Coordinate Systems**: UTM zones specific to each park
- **Processing Unit**: Grid cells for zonal statistics

### Data Quality Controls
- **Cloud Masking**: Automated cloud/shadow removal
- **Temporal Filtering**: Minimum observation requirements
- **Geometric Accuracy**: Sub-pixel registration
- **Radiometric Consistency**: Cross-sensor calibration

## Output Products

### Raster Layers (per park, per index, per metric)
- Individual GeoTIFF files for each EFA metric
- Consistent spatial properties within each park
- NoData values: -999.99 for invalid pixels

### Zonal Statistics
- Grid-based summaries for landscape analysis
- Segment identifiers (SID) for traceability
- Multi-band rasters with statistical metrics


## Software Dependencies

### Google Earth Engine
- JavaScript API for cloud-based processing
- Access to satellite data collections
- Computational resources for large-scale analysis

### Python Libraries
- **rasterio**: Raster I/O and processing
- **georasters**: Advanced raster operations
- **GDAL**: Geospatial data abstraction
- **numpy**: Numerical computations
- **tqdm**: Progress tracking

### R Libraries
- **raster/terra**: Raster data handling
- **SegOptim**: Segment optimization
- **dplyr**: Data manipulation
- **vegan**: Ecological statistics



## References

- Alcaraz-Segura, D., Paruelo, J., and Cabello, J.  2006: Identification of current ecosystem functional types in the Iberian Peninsula, Global Ecol. Biogeogr., 15, 200–212, https://doi.org/10.1111/j.1466-822X.2006.00215.x

- Paruelo, J. M., Jobbágy, E. G., and Sala, O. E. 2001: Current Distribution of Ecosystem Functional Types in Temperate South America, Ecosystems, 4, 683–698, https://doi.org/10.1007/s10021-001-0037-9

## Contact

For questions about EFAs methodology or data access:
- **Authors**: Domingo Alcaraz-Segura
- **Institution**: Department of Botany, University of Granada, Spain
- **Contact**: dalcaraz@ugr.es
- **EarthCul Implementation**: Carlos Javier Navarro (carlosnavarro@ugr.es)
- **Project**: EarthCul - Cultural Ecosystem Services Analysis
