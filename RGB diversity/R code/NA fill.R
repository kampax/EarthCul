library(terra)

# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

parque <- "Peneda"


# Leer el raster
r <- rast( paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\Variables Modelos\\", parque,"\\RGB diversity\\iSDI_raster.tif"))



# Verificar el rango
range(r)

plot(r)

# Obtener el nombre de la banda original
nombre_banda <- names(r)

# Reemplazar valores infinitos con NAs
r[r == Inf] <- NA
r[r == -Inf] <- NA

# Crear una máscara para los valores NA (esto identificará solo los valores NA)
mask_na <- is.na(r)

# Rellenar solo los valores NA con la media de los valores vecinos
r_filled <- focal(r, w = matrix(1, 9, 9), fun = mean, na.rm = TRUE)

# Aplicar la máscara para mantener los valores no NA
r_filled[!mask_na] <- r[!mask_na]

# Asegurarse de que el nombre de la banda se mantenga
names(r_filled) <- nombre_banda

plot(r_filled)

# Asegurarse de que el nombre de la banda se mantenga
names(r_filled) <- nombre_banda

range(r_filled)


# Clip using a polygon
# Read the polygon
pol <- vect(paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\BaseLayers\\", parque,"\\AOI_3035.shp"))

# Clip the raster
r_filled <- crop(r_filled, pol)

# Aplicar la máscara para recortar según el polígono
# r_filled <- mask(r_filled, pol)


# Guardar el raster modificado si es necesario
writeRaster(r_filled,paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\Variables Modelos\\", parque,"\\RGB diversity\\iSDI_raster.tif"), overwrite=TRUE)


# Guardar en pen drive creando carpetas si no existen

writeRaster(r_filled,paste0("C:/Users/carlo/Downloads/parques/", parque,"/iSDI_raster.tif"), overwrite=TRUE)


