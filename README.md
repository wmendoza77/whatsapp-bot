<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="120" alt="WhatsApp Bot Logo" />
</p>

<h1 align="center">WhatsApp Bot API</h1>

<p align="center">
  API REST para envío de mensajes de WhatsApp mediante <strong>whatsapp-web.js</strong> y <strong>Express</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.1.0-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/whatsapp--web.js-latest-25D366?logo=whatsapp&logoColor=white" alt="whatsapp-web.js" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 📋 Descripción

**WhatsApp Bot API** es un servidor que expone una API REST para enviar mensajes de WhatsApp de forma programática. Ideal para sistemas de notificaciones, confirmaciones de citas, alertas y más.

---

## ✨ Características

- 📨 **Envío de mensajes** vía API REST
- 🔐 **Autenticación persistente** con LocalAuth (sesión guardada)
- 📱 **Escaneo QR** en terminal para vincular WhatsApp
- ✅ **Validación de números** antes de enviar
- 🐳 **Docker Ready** con Chrome/Puppeteer preconfigurado
- 🔄 **CORS habilitado** para integración con frontend

---

## 🛠️ Tecnologías

| Tecnología          | Uso                          |
| ------------------- | ---------------------------- |
| **Node.js**      | Runtime de JavaScript        |
| **Express**       | Framework web para la API    |
| **whatsapp-web.js** | Cliente de WhatsApp Web      |
| **Puppeteer**       | Automatización del navegador |
| **Docker**          | Containerización             |

---

## 🚀 Instalación

### Requisitos Previos

- Node.js o superior
- npm o yarn

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/haderrenteria13/whatsapp-bot.git
cd whatsapp-bot

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

### Instalación con Docker

```bash
# Construir la imagen
docker build -t whatsapp-bot .

# Ejecutar el contenedor
docker run -p 3001:3001 -v $(pwd)/.wwebjs_auth:/usr/src/app/.wwebjs_auth whatsapp-bot
```

> 💡 El volumen `-v` persiste la sesión de WhatsApp entre reinicios del contenedor.

---

## 📱 Configuración Inicial

1. Inicia el servidor con `npm start`
2. Aparecerá un **código QR** en la terminal
3. Abre WhatsApp en tu teléfono → **Dispositivos vinculados** → **Vincular dispositivo**
4. Escanea el código QR
5. ¡Listo! Verás el mensaje: `✅ ¡El Bot de WhatsApp está listo y conectado!`

---

## 📡 API Endpoints

### Enviar Mensaje

```http
POST /enviar-mensaje
Content-Type: application/json
```

#### Body

```json
{
  "phone": "573001234567",
  "message": "¡Hola! Este es un mensaje de prueba 👋"
}
```

> ⚠️ El número debe incluir el código de país sin el signo `+` (ej: `57` para Colombia)

#### Respuestas

**✅ Éxito (200)**

```json
{
  "success": true,
  "message": "Mensaje enviado correctamente"
}
```

**❌ Datos faltantes (400)**

```json
{
  "error": "Faltan datos (phone, message)"
}
```

**❌ Número no registrado (404)**

```json
{
  "error": "El número no está registrado en WhatsApp"
}
```

**❌ Error interno (500)**

```json
{
  "error": "Error interno al enviar mensaje"
}
```

---

## 🔧 Variables de Entorno

| Variable | Descripción         | Default |
| -------- | ------------------- | ------- |
| `PORT`   | Puerto del servidor | `3001`  |

---

## 📁 Estructura del Proyecto

```
whatsapp-bot/
├── index.js          # Servidor Express y cliente WhatsApp
├── package.json      # Dependencias y scripts
├── Dockerfile        # Configuración Docker
├── .wwebjs_auth/     # Sesión de WhatsApp (ignorar en git)
└── README.md         # Documentación
```

---

## ⚠️ Consideraciones Importantes

- 🔒 **No compartas** la carpeta `.wwebjs_auth/` - contiene tu sesión de WhatsApp
- 📵 **WhatsApp puede banear** cuentas que envíen spam o mensajes masivos no solicitados
- 🕐 **Usa con moderación** para evitar restricciones de WhatsApp
- 📱 **Mantén tu teléfono conectado** a internet para que el bot funcione

---

## 👤 Autor

**Hader Renteria**

- GitHub: [@haderrenteria13](https://github.com/haderrenteria13)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

<p align="center">
  Hecho con ❤️ por Hader Renteria
</p>