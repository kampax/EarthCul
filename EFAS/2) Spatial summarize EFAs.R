################################################################################
# Project: EFAs (Ecological Functional Attributes)
# Author: Carlos Javier Navarro
# Email: carlosnavarro@ugr.es
# Description: This script processes multi-temporal Sentinel-2 mosaics to extract
#              zonal statistics (median and standard deviation) for Red, Green, and
#              Blue bands over predefined spatial units (grid cells) of a selected
#              protected area. The output includes per-segment metrics exported as
#              raster layers, enabling functional diversity and heterogeneity analyses.
#
# Functionality:
# - Loads Sentinel-2 seasonal mosaics (preprocessed and reprojected).
# - Resamples the grid to match Sentinel-2 resolution and extent.
# - Computes per-segment statistics across all mosaics.
# - Renames and exports resulting segment metrics as individual GeoTIFF layers.
# - Optionally renames bands in the original mosaics for clarity.
#
# Input:
# - Reprojected Sentinel-2 mosaics (*.tif)
# - Grid raster (integer values used as segment IDs)
#
# Output:
# - One raster layer per statistic per band and season in results/<park_name>/
#
# Notes:
# - High RAM usage (~8.5 GB) expected during segment statistic calculations.
# - Grid values (SID) must match segment identifiers; ensure validity.
# - Based on methodology from Vaz et al., using a 1 km² grid to capture spatial patterns.
################################################################################




library(raster)
library(terra)
library(dplyr)
library(vegan)
library(SegOptim)

setwd("C:/Users/carlo/Desktop/EFAs")



## Define paths to data files and folders ---------------------------------------


gridFilePath <- getwd()

# Not needed here... only the raster grid
# gridFileName <- "Aiguestortes_grid_25830"



# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

parque <- "Teide"

# Provide a raster grid, check the path and name
rstGridFilePath <- paste0("C:/Users/carlo/Desktop/EFAs/grid/", parque, "/Grid_new.tif")
crs_info <- raster::crs(rast(rstGridFilePath))
print(crs_info)

## Load data -------------------------------------------------------------------- 

#, "/res2"

# Sentinel 2 multi-temporal mosaics
mosaicFiles <- list.files(paste0( parque, "/reprojected"), pattern = ".tif$", full.names = TRUE)
rstMosaic <- stack(mosaicFiles)
names(rstMosaic)



# Resample the raster grid to the same resolution, extent and CRS as
# the input Sentinel-2 layers otherwise it wont work

z <- resample(rast(rstGridFilePath), rast(mosaicFiles), method="near")

# Force/set the resampled raster as an integer raster
# z <- as.int(z)


# Check the resampled raster:
# The integer values will be used as regions to calculate zonal statistics
# In the data only 5 regions exist: [1, 4, 5, 6 and 7]... Is that correct?? 
# It will work but check if this option is adequate
#
# In the Vaz et al paper we used a 1x1km regular grid to capture finer details

plot(z)


# writeRaster(z, "C:/Users/carlo/Desktop/Diversity/resamp/Grid_25830_resampled.tif")
## Loop through different seasonal mosaics -------------------------------------
## Calculate mean and std for Sentinel-2 spectral bands 2,3,4 (B,G,R)

nFiles <- length(mosaicFiles)

pb <- txtProgressBar(0, nFiles, style=3)


## [[WARNING]]
## Functions in the loop are fast but will use ~8.5 Gb of RAM, so make sure you have enough 
## memory in your machine


# Loop through all Sentinel-2 raster mosaic files
for(i in 1:nFiles){

  # This uses only the blue, green and blue bands of Sentinel-2, RGB
  # for each sesonal Sentinel-2 mosaic
  rstMosaic <- (rast(mosaicFiles[i]))[[1:3]]

  if(i==1){

    # Calculate the average and std-deviation
    rstMosaicStats <- calculateSegmentStats(rstMosaic, z,
                                            funs = c("median", "sd"), na.rm = TRUE)

  }else{

    # Create a temporary data frame to append to the previous ones
    rstMosaicStats_TMP <- calculateSegmentStats(rstMosaic, z,
                                                funs = c("median", "sd"), na.rm = TRUE)

    # Aggregate the data across each seasonal mosaic
    rstMosaicStats <- merge(rstMosaicStats,rstMosaicStats_TMP,by="SID")
  }
  setTxtProgressBar(pb,i)
}

# ?? rstMosaicStats[-2689,] ??
# Better to use a filter to remove wrong values if this is what this line is
# trying to do ..
# Use dplyr code to filter, example: rstMosaicStats %>% filter(SID != NA)

# rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))
rstMosaicStats = as.data.frame(rstMosaicStats)
length(unique(rstMosaicStats$SID))

# rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))

# Exclude NA after applying the view identified the column
# rstMosaicStats = rstMosaicStats[1:166477, ]

#######################
####Export as Tiff###
#######################

library(terra)

base <- rast(rstGridFilePath)

raster_base <- base

# # Assuming 'z' is your base raster and 'rstClustStats.DivInd' is your dataframe
# # Make sure 'z' has unique values that correspond to the IDs in 'rstClustStats.DivInd'
#
# # First, create a raster for each column of interest in rstClustStats.DivInd
# columnas <- names(rstMosaicStats)[2:25] # Ajusta el índice según tus columnas de interés
# columnas <- names(rstMosaicStats)[2:ncol(rstMosaicStats)] # Ajusta el índice según tus columnas de interés

test<-basename(mosaicFiles)

# Create combinations and join them into a single string

result <- sub("_2018.*", "", test)

# Step 2: Add _median and _sd to each modified name
result <- paste0(rep(result, each = 2), c("_median", "_sd"))

result <- sub("SR_SENTINEL_", "", result)

# Replace double underscores with a single underscore
result <- gsub("__", "_", result)
new_colnames <- c("SID", result)


# Assign the new names to the columns of the data frame
colnames(rstMosaicStats) <- new_colnames

columnas <- names(rstMosaicStats)[2:113]

rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))

for(col in columnas){
  # Create an empty raster with the same extent and resolution as 'z'
  rast_temp <- rast(raster_base)

  # Use the SID values as indices to assign the values of the current column to the raster
  vals <- rstMosaicStats[[col]]
  ids <- match(rstMosaicStats$SID, values(raster_base))
  rast_temp[ids] <- vals

  # Save the resulting raster
  writeRaster(rast_temp, paste0("C:/Users/carlo/Desktop/EFAs/results/",parque,"/", col, "_raster.tif"), overwrite=TRUE)
}


#### If I want to rename the bands with the layer name
library(terra)
library(fs)

# Set the working directory to the folder where the .tif files are located


# Get the list of all .tif files in the folder
tif_files <- mosaicFiles
  # dir_ls(glob = "*.tif")

for (tif_file in tif_files) {
  # Load the image as a raster object
  raster_obj <- rast(tif_file)

  # Get the base name of the file (without extension)
  base_name <- path_ext_remove(path_file(tif_file))

  # Rename the bands using the file name
  names(raster_obj) <- paste0(base_name, seq_along(names(raster_obj)))

  # Create a temporary name for the file
  temp_file <- tempfile(fileext = ".tif")

  # Save the temporary file with the renamed bands
  writeRaster(raster_obj, temp_file, overwrite = TRUE)

  # Replace the original file with the temporary file
  file_copy(temp_file, tif_file, overwrite = TRUE)

  # Delete the temporary file
  file_delete(temp_file)
}



