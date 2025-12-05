# Comandos para aplicar cambios en el servidor

## Después de hacer `git pull`

### 1. Ir al directorio del backend
```bash
cd /var/www/eventixs.es/backend
```

### 2. Limpiar todas las cachés
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### 3. Regenerar cachés de producción
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. (Opcional) Si instalaste nuevas dependencias
```bash
composer install --optimize-autoloader --no-dev
```

### 5. Verificar que todo funciona
```bash
# Verificar que no hay errores de sintaxis
php artisan about

# O probar una ruta
curl http://localhost/api/health
```

---

## Comandos en una sola línea (copia y pega)

```bash
cd /var/www/eventixs.es/backend && php artisan config:clear && php artisan route:clear && php artisan view:clear && php artisan cache:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache
```

---

## Si hay errores después

### Ver logs de Laravel
```bash
tail -f storage/logs/laravel.log
```

### Verificar permisos
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

