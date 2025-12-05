# Comandos para desplegar el frontend en producción

## Pasos completos para actualizar el frontend

### 1. Actualizar código
```bash
cd /var/www/eventix/web
git pull
```

### 2. Instalar dependencias (si hay cambios en package.json)
```bash
npm install
```

### 3. Construir el frontend
```bash
npm run build
```

Esto genera los archivos en `web/dist/`

### 4. Verificar que el build se generó correctamente
```bash
ls -la dist/
# Deberías ver index.html y la carpeta assets/
```

### 5. Verificar permisos (importante)
```bash
# Asegurar que Nginx puede leer los archivos
chown -R www-data:www-data dist/
chmod -R 755 dist/
```

### 6. Limpiar caché del navegador (opcional pero recomendado)
Si Nginx tiene caché, puedes limpiarla:
```bash
# Reiniciar Nginx para limpiar caché
systemctl reload nginx
# O si estás usando Docker:
docker-compose restart nginx
```

### 7. Verificar que Nginx está sirviendo los archivos correctos
```bash
# Verificar la configuración de Nginx
nginx -t

# Ver los logs de Nginx si hay problemas
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## Problemas comunes

### El frontend no se actualiza
1. **Caché del navegador**: Haz Ctrl+Shift+R (o Cmd+Shift+R en Mac) para forzar recarga
2. **Caché de Nginx**: Reinicia Nginx con `systemctl reload nginx`
3. **Archivos no generados**: Verifica que `dist/` tiene archivos nuevos con `ls -la dist/`
4. **Permisos incorrectos**: Asegúrate de que `www-data` puede leer los archivos

### El build falla
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Verificar que los cambios están en el código
```bash
# Ver el contenido del archivo compilado
cat dist/assets/index-*.js | grep "update-with-image"
# Deberías ver la nueva ruta en el código
```

## Comandos rápidos (todo en uno)
```bash
cd /var/www/eventix/web && \
git pull && \
npm install && \
npm run build && \
chown -R www-data:www-data dist/ && \
chmod -R 755 dist/ && \
echo "Frontend actualizado correctamente"
```

