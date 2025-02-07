library(raster)
library(terra)
library(dplyr)
library(vegan)
library(SegOptim)

# 
gridFilePath <- getwd()

# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

parque <- "Aiguestortes"

# Provide a raster grid, check the path and name
rstGridFilePath <- paste0("C:/Users/carlo/Desktop/Diversity2/grid/", parque, "/grid.tif")


## Load data -------------------------------------------------------------------- 


# Sentinel 2 multi-temporal mosaics
mosaicFiles <- list.files(paste0("./S2_PG/", parque, "/res2"), pattern = "_mosaic.tif$", full.names = TRUE)
#rstMosaic <- stack(mosaicFiles)

# Clustered data using k-means
clustFiles <- list.files(paste0("./S2_PG/", parque , "/res2"), pattern = "_clust-1.tif$", full.names = TRUE)
rstClust <- rast(clustFiles)

plot(rstClust)
# Resample the raster grid to the same resolution, extent and CRS as
# the input Sentinel-2 layers otherwise it wont work

z <- resample(rast(rstGridFilePath), rast(mosaicFiles), method="near")

# Force/set the resampled raster as an integer raster
# z <- as.int(z)


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
                                            funs = c("mean", "sd"), na.rm = TRUE)

  }else{

    # Create a temporary data frame to append to the previous ones
    rstMosaicStats_TMP <- calculateSegmentStats(rstMosaic, z,
                                                funs = c("mean", "sd"), na.rm = TRUE)

    # Aggregate the data across each seasonal mosaic
    rstMosaicStats <- merge(rstMosaicStats,rstMosaicStats_TMP,by="SID")
  }
  setTxtProgressBar(pb,i)
}

# Better to use a filter to remove wrong values if this is what this line is
# trying to do ..
# Use dplyr code to filter, example: rstMosaicStats %>% filter(SID != NA)


rstMosaicStats = as.data.frame(rstMosaicStats)
length(unique(rstMosaicStats$SID))


#######################
####Export like Tiff###
#######################

library(terra)

base <- rast(rstGridFilePath)

raster_base <- base

# # Assuming 'z' is your base raster and 'rstClustStats.DivInd' is your dataframe
# # Make sure 'z' has unique values that correspond to the IDs in 'rstClustStats.DivInd'
#


# Crear un vector con los nuevos nombres de las columnas
new_colnames <- c("SID","B4_autumn_mean", "B3_autumn_mean", "B2_autumn_mean",
                  "B4_autumn_sd", "B3_autumn_sd", "B2_autumn_sd",
                  "B4_spring_mean", "B3_spring_mean", "B2_spring_mean",
                  "B4_spring_sd", "B3_spring_sd", "B2_spring_sd",
                  "B4_summer_mean", "B3_summer_mean", "B2_summer_mean",
                  "B4_summer_sd", "B3_summer_sd", "B2_summer_sd",
                  "B4_winter_mean", "B3_winter_mean", "B2_winter_mean",
                  "B4_winter_sd", "B3_winter_sd", "B2_winter_sd")

# Asignar los nuevos nombres a las columnas del data frame
colnames(rstMosaicStats) <- new_colnames

columnas <- names(rstMosaicStats)[2:25]

rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))

for(col in columnas){
  # Crea un raster vacío con la misma extensión y resolución que 'z'
  rast_temp <- rast(raster_base)

  # Usa los valores de SID como índices para asignar los valores de la columna actual al raster
  vals <- rstMosaicStats[[col]]
  ids <- match(rstMosaicStats$SID, values(raster_base))
  rast_temp[ids] <- vals

  # Guarda el raster resultante
  writeRaster(rast_temp, paste0("C:/Users/carlo/Desktop/Diversity2/results/",parque,"/", col, "_raster.tif"), overwrite=TRUE)
}


# write.csv(rstMosaicStats,file = paste0(parque,"S2_SpectralDiversity_VIS_1k-v1.csv"),
#           row.names = FALSE)


# Calculate "cluster" richness (i.e., # of clusters inside each region)
nclust <- function(x, na.rm){
  if(na.rm){
    x<-unique(x)
    length(x[!is.na(x)])
  }else{
    length(unique(x))
  }
}

# Diversity measures from vegan package
SHDI <- function(x, na.rm=TRUE) diversity(x, index = "shannon")
cSDI <- function(x, na.rm=TRUE) 1 - diversity(x, index = "simpson")
iSDI <- function(x, na.rm=TRUE) diversity(x, index = "invsimpson")


# Calculate the diversity indices using k-means clusters for each region
# and for all seasons all at once
rstClustStats.DivInd <- calculateSegmentStats(rstClust, z, 
                                              funs = c("nclust","SHDI","cSDI","iSDI"), na.rm = TRUE)


rstClustStats.DivInd <- rstClustStats.DivInd %>% filter(!is.na(SID))

length(unique(rstClustStats.DivInd$SID))


# write.csv(rstClustStats.DivInd,file = "S2_ClustDiversity_1k-v1.csv",row.names = FALSE)



################################
### Rasterizar columnas ########
################################

library(terra)

base <- rast(rstGridFilePath)

raster_base <- base

# Asumiendo que 'z' es tu raster base y 'rstClustStats.DivInd' es tu dataframe
# Asegúrate de que 'z' tiene valores únicos que corresponden a los IDs en 'rstClustStats.DivInd'

# Primero, crea un raster para cada columna de interés en rstClustStats.DivInd
columnas <- names(rstClustStats.DivInd)[2:ncol(rstClustStats.DivInd)] # Ajusta el índice según tus columnas de interés

for(col in columnas){
  # Crea un raster vacío con la misma extensión y resolución que 'z'
  rast_temp <- rast(raster_base)

  # Usa los valores de SID como índices para asignar los valores de la columna actual al raster
  vals <- rstClustStats.DivInd[[col]]
  ids <- match(rstClustStats.DivInd$SID, values(raster_base))
  rast_temp[ids] <- vals

  # Guarda el raster resultante
  writeRaster(rast_temp, paste0("C:/Users/carlo/Desktop/Diversity2/results/",parque,"/", col, "_raster.tif"), overwrite=TRUE)
}

