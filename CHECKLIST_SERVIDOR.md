# ✅ Checklist para Desplegar en el Servidor

## Pasos después de hacer `git pull` en el servidor

### 1. Backend - Instalar dependencias (si hay cambios)

```bash
cd /var/www/eventixs.es/backend
composer install --optimize-autoloader --no-dev
```

### 2. Backend - Crear enlace simbólico de Storage (IMPORTANTE)

```bash
cd /var/www/eventixs.es/backend
php artisan storage:link
```

Esto crea el enlace `public/storage` → `storage/app/public` para que las imágenes sean accesibles.

### 3. Backend - Crear directorio para imágenes de eventos

```bash
mkdir -p /var/www/eventixs.es/backend/storage/app/public/event_images
chmod -R 775 /var/www/eventixs.es/backend/storage/app/public/event_images
```

### 4. Backend - Configurar permisos de Storage

```bash
sudo chown -R www-data:www-data /var/www/eventixs.es/backend/storage
sudo chmod -R 775 /var/www/eventixs.es/backend/storage
sudo chmod -R 775 /var/www/eventixs.es/backend/bootstrap/cache
```

### 5. Backend - Limpiar y regenerar cachés

```bash
cd /var/www/eventixs.es/backend
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Regenerar cachés de producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6. Frontend - Compilar para producción

```bash
cd /var/www/eventixs.es/web
npm install
npm run build
```

### 7. Verificar que todo funciona

```bash
# Verificar que el enlace simbólico existe
ls -la /var/www/eventixs.es/backend/public/storage

# Debe mostrar algo como:
# storage -> /var/www/eventixs.es/backend/storage/app/public

# Verificar permisos
ls -la /var/www/eventixs.es/backend/storage/app/public/event_images
```

### 8. Probar subir una imagen

1. Ir al panel de administrador
2. Crear o editar un evento
3. Subir una imagen
4. Verificar que se guarda correctamente

---

## ⚠️ Si algo no funciona

### Error: "Storage link already exists"
```bash
# Eliminar el enlace existente y recrearlo
rm /var/www/eventixs.es/backend/public/storage
php artisan storage:link
```

### Error: "Permission denied" al subir imágenes
```bash
# Ajustar permisos
sudo chown -R www-data:www-data /var/www/eventixs.es/backend/storage
sudo chmod -R 775 /var/www/eventixs.es/backend/storage
```

### Las imágenes no se muestran
1. Verificar que el enlace simbólico existe: `ls -la public/storage`
2. Verificar permisos del directorio: `ls -la storage/app/public/event_images`
3. Verificar que Nginx puede acceder a `/storage` (debe estar configurado en nginx)

---

## 📋 Resumen rápido

```bash
# En el servidor, después de git pull:
cd /var/www/eventixs.es/backend
composer install --optimize-autoloader --no-dev
php artisan storage:link
mkdir -p storage/app/public/event_images
sudo chown -R www-data:www-data storage
sudo chmod -R 775 storage bootstrap/cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

cd /var/www/eventixs.es/web
npm install
npm run build
```

¡Listo! 🚀

