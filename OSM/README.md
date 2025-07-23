# OpenStreetMap (OSM) Variables

This module extracts and processes OpenStreetMap data to quantify to generate spatial layers that will be used in the spatial modeling of ecosystem services from social media data across 8 Spanishn and Portuguese National Parks for the EarthCul project's Cultural Ecosystem Services analysis.

## Overview

OpenStreetMap provides crowdsourced geospatial data on infrastructure, amenities, and cultural features that are essential for understanding human activities and cultural ecosystem services in protected areas. This module implements a comprehensive workflow from data download to derived metrics calculation.

## Data Source

- **Platform**: [OpenStreetMap](https://www.openstreetmap.org/)
- **API**: Overpass API for programmatic data access
- **Coverage**: Global, community-maintained geospatial database
- **Licensing**: Open Database License (ODbL)

## Methodology

### 1. Data Download (`1_Variable download/`)

**Script**: `1_Download layers.ipynb`
- **Purpose**: Download OSM features using Overpass API queries
- **Method**: Bounding box queries for each national park
- **Output**: Individual GeoJSON files per feature type and park

**Script**: `2_Join layers.ipynb`
- **Purpose**: Consolidate related OSM features into thematic categories
- **Method**: Merge semantically similar features (e.g., roads, accommodation types)
- **Output**: Consolidated GeoJSON files by theme

### 2. Derived Metrics (`2_Derived metrics/`)

**Count Metrics** (`count/`):
- **Script**: `3_Count point.ipynb`
- **Purpose**: Calculate feature density within grid cells
- **Method**: Spatial intersection with regular grid
- **Output**: Raster layers with feature counts per cell

**Presence/Absence** (`presence/`):
- **Script**: `4_Presence and absence.ipynb`
- **Purpose**: Binary presence indicators for each feature type
- **Method**: Convert count data to binary (0/1) values
- **Output**: Raster layers with presence/absence data

**Distance Metrics** (`distance/`):
- **Purpose**: Calculate proximity to infrastructure features
- **Method**: Travel distance using whitetoolbox libraries in python
- **Output**: Distance raster layers


## Feature Categories

### Infrastructure and Transportation
- **Roads**: Motorways, highways, primary/secondary roads, tracks
- **Streets**: Residential, service, living streets
- **Railway**: Rail infrastructure
- **Parking**: Vehicle, bicycle, motorcycle parking facilities
- **Public Transport**: Bus stops, transportation hubs

### Tourism and Recreation
- **Accommodation**: Hotels, hostels, camping sites, mountain huts
- **Restaurants and Bars**: Dining establishments, cafes
- **Tourism Attractions**: Museums, viewpoints, cultural sites
- **Recreational Areas**: Parks, playgrounds, sports facilities
- **Routes**: Hiking trails, cycling routes, ski facilities

### Natural Features
- **Water Bodies**: Lakes, rivers, reservoirs, streams
- **Beaches**: Coastal and lakshore areas
- **Geological Features**: Peaks, cliffs, glaciers, volcanic features
- **Green Spaces**: Parks, gardens, picnic areas

### Cultural and Historic Sites
- **Historic**: Monuments, memorials, monasteries
- **Religious Places**: Churches, temples, places of worship
- **Archaeological**: Paleontological sites, cultural heritage

### Services and Amenities
- **Utilities**: Drinking water, fountains, WiFi access
- **Community**: Community centres, social facilities
- **Emergency**: Refuges, shelters, safety facilities
- **Sports**: Climbing areas, courts, recreational facilities

## Processing Workflow

### Phase 1: Data Acquisition
1. **Download Individual Features**: Query Overpass API for specific OSM tags
2. **Bounding Box Definition**: Use park boundaries to limit search area
3. **Feature Extraction**: Save individual feature types as GeoJSON files

### Phase 2: Data Consolidation  
1. **Thematic Grouping**: Merge related features (e.g., all road types)
2. **Geometry Standardization**: Convert points/lines to polygons for consistent analysis
3. **Duplicate Removal**: Eliminate overlapping geometries from layer merging

### Phase 3: Spatial Analysis
1. **Grid-based Counting**: Calculate feature density within regular grid cells
2. **Presence Mapping**: Generate binary presence/absence indicators
3. **Distance Calculation**: Compute proximity to key infrastructure
4. **Rasterization**: Convert vector results to raster format for integration



## References

- [OpenStreetMap](https://www.openstreetmap.org/): Community-driven mapping platform
- [Overpass API](https://overpass-api.de/): OSM data query interface
- [OSM Wiki](https://wiki.openstreetmap.org/): Feature tagging documentation

## Contact

For questions about OSM data processing or methodology:
- **Author**: Carlos Javier Navarro
- **Email**: carlosnavarro@ugr.es
- **Project**: EarthCul - Cultural Ecosystem Services Analysis