# RGB Diversity Analysis

This module calculates spectral and categorical diversity metrics from seasonal Sentinel-2 imagery to quantify landscape heterogeneity and visual complexity across Spanish National Parks for Cultural Ecosystem Services analysis.

## Overview

RGB diversity analysis uses unsupervised classification of seasonal satellite imagery to quantify landscape heterogeneity - a key driver of aesthetic and recreational values in protected areas. The methodology combines spectral analysis with categorical diversity indices to characterize landscape visual complexity and seasonal dynamics.

## Methodology and Attribution

### Original Development
The core methodology was **originally developed by João Gonçalves** (University of Porto, Portugal) 2019. The original approach pioneered the use of seasonal K-means clustering of Sentinel-2 imagery for landscape diversity assessment.

**Citation for Original Method:**
> Vaz, A. S., Gonçalves, J. F., Pereira, P., Santarém, F., Vicente, J. R., & Honrado, J. P. (2019). Earth observation and social media: Evaluating the spatiotemporal contribution of non-native trees to cultural ecosystem services. Remote Sensing of Environment, 230, 111193.

### EarthCul Implementation
The methodology has been **adapted and implemented for the EarthCul project** by Carlos Javier Navarro (University of Granada, Spain) with modifications for:
- Multi-park comparative analysis
- Integration with Cultural Ecosystem Services framework
- Standardized grid-based zonal statistics
- Enhanced diversity index calculation



## Processing Workflow

### Phase 1: Seasonal Image Preparation (`GEE code/Seasonal KMeans clustering.js`)

**Google Earth Engine Implementation**:
1. **Sentinel-2 Data Collection**: 2017-2022 Surface Reflectance Harmonized
2. **Seasonal Filtering**: Four meteorological seasons
   - Winter: December-February
   - Spring: March-May  
   - Summer: June-August
   - Autumn: September-November
3. **Quality Control**: Cloud coverage <30%, metadata filtering
4. **Median Compositing**: Robust seasonal mosaics per RGB band
5. **K-means Clustering**: 20 clusters per seasonal mosaic
6. **Export**: Both RGB mosaics and cluster maps to Google Drive

### Phase 2: Diversity Calculation (`R code/Color diversity analysis.R`)

**Zonal Statistics Processing**:
1. **Data Integration**: Load seasonal mosaics and cluster maps
2. **Grid Resampling**: Align analysis grid with Sentinel-2 resolution
3. **Spectral Statistics**: Mean and standard deviation per RGB band per season
4. **Categorical Diversity**: Calculate diversity indices per cluster map:
   - **Richness**: Number of different cluster types
   - **Shannon Index**: Entropy-based diversity measure
   - **Simpson Index**: Dominance-based diversity measure  
   - **Inverse Simpson**: Effective number of cluster types
5. **Export**: CSV statistics and individual raster layers

### Phase 3: Data Cleaning (`R code/NA fill.R`)


## Technical Specifications

### Spatial Properties
- **Base Resolution**: 10m (Sentinel-2 native)
- **Analysis Grid**: 100m × 100m cells for zonal statistics
- **Coordinate System**: EPSG:3035 (LAEA Europe)
- **Temporal Coverage**: 2017-2022 (6 years)

### Clustering Parameters
- **Algorithm**: K-means unsupervised classification
- **Number of Clusters**: 20 per seasonal mosaic
- **Input Bands**: RGB (Sentinel-2 B4, B3, B2)
- **Training Samples**: 5000 pixels per season per park

### Diversity Metrics Calculated

#### Spectral Diversity (per season, per RGB band)
- **Mean Values**: Average spectral response
- **Standard Deviation**: Within-cell spectral variability

#### Categorical Diversity (per season, per cluster map)
- **Richness (S)**: Number of cluster types per grid cell
- **Shannon Index (H')**: $H' = -\sum p_i \ln(p_i)$
- **Simpson Index (D)**: $D = \sum p_i^2$ 
- **Inverse Simpson (1/D)**: Effective number of cluster types

Where $p_i$ is the proportion of cluster type $i$ within each grid cell.


### Data Flow
1. **GEE Processing**: Generate seasonal mosaics and clusters
2. **R Analysis**: Calculate diversity metrics per grid cell
3. **Spatial Integration**: Align with other environmental variables
4. **CES Modeling**: Use diversity as predictor in cultural service models

### Standardization
- **Coordinate Systems**: Consistent EPSG:3035 projection
- **Grid Framework**: 100m analysis units across all modules
- **Quality Standards**: Unified metadata and documentation

## Key References

### Original Methodology by João Gonçalves
- **Original Paper**:
> Vaz, A. S., Gonçalves, J. F., Pereira, P., Santarém, F., Vicente, J. R., & Honrado, J. P. (2019). Earth observation and social media: Evaluating the spatiotemporal contribution of non-native trees to cultural ecosystem services. Remote Sensing of Environment, 230, 111193.

## Contact Information

### Current Implementation
- **Author**: Carlos Javier Navarro
- **Email**: carlosnavarro@ugr.es
- **Institution**: University of Granada, Spain

### Original Method
- **Original Developer**: João Gonçalves
- **Institution**: University of Porto, Portugal

### Project Context
- **Project**: EarthCul - Cultural Ecosystem Services Analysis
