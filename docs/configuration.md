# Configuración de secretos y claves

Este proyecto no debe almacenar credenciales reales en los archivos de configuración incluidos en el repositorio. Usa variables de entorno o el gestor de *user secrets* de .NET para mantener seguros los valores sensibles.

## API (.NET)

La API lee los siguientes valores de configuración:

| Sección | Clave | Descripción |
|---------|-------|-------------|
| `Smtp`  | `Host`, `Port`, `User`, `Pass` | Credenciales del servidor SMTP que envía los correos de confirmación y restablecimiento de contraseña. |
| `Email` | `From` | Dirección visible como remitente de los correos. |
| `Stripe` | `PublishableKey`, `ApiKey`, `WebhookSecret` | Claves del dashboard de Stripe para habilitar pagos y webhooks. |
| `Auth` | `ResetPasswordUrl`, `ConfirmEmailUrl` | Rutas absolutas que recibirán los enlaces enviados por correo (habitualmente la SPA). |
| `Cart` | `CookieName`, `CookieSameSite`, `CookieSecure`, `CookieLifetimeDays`, `CookieDomain`, `CookiePath` | Parámetros para la cookie que preserva el carrito anónimo hasta que el usuario inicie sesión. |

En `appsettings.Development.json` se incluyen credenciales de Mailtrap (sandbox) para que el envío de correos funcione al levantar `docker compose` sin configuraciones adicionales. El servicio frontend también se inicia por defecto, por lo que basta ejecutar `docker compose -f docker-compose.roue.yml up -d` para tener API + SPA trabajando en `http://localhost:8080` y `http://localhost:4200`. Para entornos distintos a desarrollo reemplaza esas credenciales con las tuyas propias usando alguna de las siguientes opciones.

### Variables de entorno

```bash
export Smtp__Host=smtp.servidor.com
export Smtp__Port=587
export Smtp__User=mi_usuario
export Smtp__Pass=mi_password
export Email__From=no-reply@midominio.com
export Stripe__PublishableKey=pk_live_xxx
export Stripe__ApiKey=sk_live_xxx
export Stripe__WebhookSecret=whsec_xxx
export Cart__CookieName=cart_id
export Cart__CookieSameSite=None
export Cart__CookieSecure=Conditional
export Cart__CookieLifetimeDays=30

dotnet run --project src/Roue.API
```

> Usa el mismo patrón (`__`) para cualquier valor anidado de `appsettings.*`.

### Secretos de usuario (.NET)

Dentro del directorio `src/Roue.API` ejecuta:

```bash
dotnet user-secrets init        # solo la primera vez
dotnet user-secrets set "Smtp:Host" "smtp.servidor.com"
dotnet user-secrets set "Smtp:Port" "587"
dotnet user-secrets set "Smtp:User" "mi_usuario"
dotnet user-secrets set "Smtp:Pass" "mi_password"
dotnet user-secrets set "Email:From" "no-reply@midominio.com"
dotnet user-secrets set "Stripe:PublishableKey" "pk_live_xxx"
dotnet user-secrets set "Stripe:ApiKey" "sk_live_xxx"
dotnet user-secrets set "Stripe:WebhookSecret" "whsec_xxx"
```

Los valores quedan guardados fuera del repositorio y .NET los cargará automáticamente en los entornos de desarrollo.

## SPA (Angular)

El proyecto web no utiliza claves secretas en tiempo de compilación. Asegúrate de exponer las claves públicas necesarias (por ejemplo, `Stripe.publishableKey`) a través de una API segura (`/api/config`) o de variables que el backend inyecte en la respuesta HTML.
