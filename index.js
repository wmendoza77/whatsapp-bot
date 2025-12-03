const express = require("express");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// ==================== EVENTOS ====================

client.on("qr", (qr) => {
  console.log("ESCANEA ESTE CODIGO QR CON EL WHATSAPP:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("¡El Bot de WhatsApp está listo y conectado!");
});

client.on("auth_failure", (msg) => {
  console.error("Error de autenticación:", msg);
});

client.on("loading_screen", (percent, message) => {
  console.log("⏳ Cargando WhatsApp Web:", percent, "%", message);
});

client.on("authenticated", () => {
  console.log("✅ Autenticado correctamente");
});

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Descargar archivo desde URL
 */
async function descargarDesdeURL(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    throw new Error(`Error descargando archivo: ${error.message}`);
  }
}

/**
 * Obtener tipo MIME basado en extensión
 */
function obtenerMimeType(filename) {
  const extensiones = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  const ext = path.extname(filename).toLowerCase().slice(1);
  return extensiones[ext] || "application/octet-stream";
}

/**
 * Validar número de teléfono - MEJORADA
 */
async function validarNumero(phone) {
  try {
    // Verificar que el cliente esté listo
    if (!client.info) {
      throw new Error(
        'Bot de WhatsApp no está listo aún. Escanea el QR y espera a que muestre "listo y conectado"'
      );
    }

    // Limpiar el número: remover +, espacios, guiones, paréntesis
    let numeroLimpio = phone.replace(/[+\s\-()]/g, "");

    // Si tiene menos de 10 dígitos, probablemente sea incompleto
    if (numeroLimpio.length < 10) {
      throw new Error(
        `Número muy corto: ${phone}. Debe tener al menos 10 dígitos`
      );
    }

    console.log(`📱 Validando número: ${numeroLimpio}`);

    // Usar directamente el formato serializado sin validar con getNumberId
    const chatId = `${numeroLimpio}@c.us`;
    return chatId;
  } catch (error) {
    throw new Error(`Error al validar número: ${error.message}`);
  }
}

// ==================== ENDPOINTS ====================

// Endpoint para enviar mensaje de texto
app.post("/enviar-mensaje", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Faltan datos (phone, message)" });
  }

  try {
    // Verificar que el cliente esté listo
    if (!client.info) {
      return res.status(503).json({
        error:
          'Bot de WhatsApp no está listo aún. Escanea el QR y espera a que muestre "listo y conectado"',
      });
    }

    const chatId = await validarNumero(phone);
    await client.sendMessage(chatId, message);
    console.log(`📨 Mensaje enviado a ${phone}`);

    res.json({
      success: true,
      message: "Mensaje enviado correctamente",
      phone: phone,
    });
  } catch (error) {
    console.error("Error enviando mensaje:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==================== IMÁGENES ====================

// Enviar imagen desde BASE64
app.post("/enviar-imagen-base64", async (req, res) => {
  const { phone, base64, caption = "", filename = "imagen.jpg" } = req.body;

  if (!phone || !base64) {
    return res.status(400).json({ error: "Faltan datos (phone, base64)" });
  }

  try {
    if (!client.info) {
      return res
        .status(503)
        .json({ error: "Bot de WhatsApp no está listo aún" });
    }

    const chatId = await validarNumero(phone);
    const media = new MessageMedia(obtenerMimeType(filename), base64, filename);
    await client.sendMessage(chatId, media, { caption });
    console.log(`🖼️ Imagen enviada a ${phone}`);
    res.json({ success: true, message: "Imagen enviada correctamente" });
  } catch (error) {
    console.error("Error enviando imagen:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Enviar imagen desde URL
app.post("/enviar-imagen-url", async (req, res) => {
  const { phone, url, caption = "", filename = "imagen.jpg" } = req.body;

  if (!phone || !url) {
    return res.status(400).json({ error: "Faltan datos (phone, url)" });
  }

  try {
    if (!client.info) {
      return res
        .status(503)
        .json({ error: "Bot de WhatsApp no está listo aún" });
    }

    const chatId = await validarNumero(phone);
    const base64 = await descargarDesdeURL(url);
    const media = new MessageMedia(obtenerMimeType(filename), base64, filename);
    await client.sendMessage(chatId, media, { caption });
    console.log(`🖼️ Imagen enviada desde URL a ${phone}`);
    res.json({ success: true, message: "Imagen enviada correctamente" });
  } catch (error) {
    console.error("Error enviando imagen desde URL:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==================== VIDEOS ====================

// Enviar video desde BASE64
app.post("/enviar-video-base64", async (req, res) => {
  const { phone, base64, caption = "", filename = "video.mp4" } = req.body;

  if (!phone || !base64) {
    return res.status(400).json({ error: "Faltan datos (phone, base64)" });
  }

  try {
    if (!client.info) {
      return res
        .status(503)
        .json({ error: "Bot de WhatsApp no está listo aún" });
    }

    const chatId = await validarNumero(phone);
    const media = new MessageMedia(obtenerMimeType(filename), base64, filename);
    await client.sendMessage(chatId, media, { caption });
    console.log(`🎥 Video enviado a ${phone}`);
    res.json({ success: true, message: "Video enviado correctamente" });
  } catch (error) {
    console.error("Error enviando video:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Enviar video desde URL
app.post("/enviar-video-url", async (req, res) => {
  const { phone, url, caption = "", filename = "video.mp4" } = req.body;

  if (!phone || !url) {
    return res.status(400).json({ error: "Faltan datos (phone, url)" });
  }

  try {
    if (!client.info) {
      return res
        .status(503)
        .json({ error: "Bot de WhatsApp no está listo aún" });
    }

    const chatId = await validarNumero(phone);
    const base64 = await descargarDesdeURL(url);
    const media = new MessageMedia(obtenerMimeType(filename), base64, filename);
    await client.sendMessage(chatId, media, { caption });
    console.log(`🎥 Video enviado desde URL a ${phone}`);
    res.json({ success: true, message: "Video enviado correctamente" });
  } catch (error) {
    console.error("Error enviando video desde URL:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==================== DOCUMENTOS ====================

// Enviar documento desde BASE64
app.post("/enviar-documento-base64", async (req, res) => {
  const { phone, base64, filename, caption = "" } = req.body;

  if (!phone || !base64 || !filename) {
    return res
      .status(400)
      .json({ error: "Faltan datos (phone, base64, filename)" });
  }

  try {
    if (!client.info) {
      return res
        .status(503)
        .json({ error: "Bot de WhatsApp no está listo aún" });
    }

    const chatId = await validarNumero(phone);
    const media = new MessageMedia(obtenerMimeType(filename), base64, filename);
    await client.sendMessage(chatId, media, { caption });
    console.log(`📄 Documento enviado a ${phone}`);
    res.json({ success: true, message: "Documento enviado correctamente" });
  } catch (error) {
    console.error("Error enviando documento:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Enviar documento desde URL
app.post("/enviar-documento-url", async (req, res) => {
  const { phone, url, filename, caption = "" } = req.body;

  if (!phone || !url || !filename) {
    return res
      .status(400)
      .json({ error: "Faltan datos (phone, url, filename)" });
  }

  try {
    if (!client.info) {
      return res
        .status(503)
        .json({ error: "Bot de WhatsApp no está listo aún" });
    }

    const chatId = await validarNumero(phone);
    const base64 = await descargarDesdeURL(url);
    const media = new MessageMedia(obtenerMimeType(filename), base64, filename);
    await client.sendMessage(chatId, media, { caption });
    console.log(`📄 Documento enviado desde URL a ${phone}`);
    res.json({ success: true, message: "Documento enviado correctamente" });
  } catch (error) {
    console.error("Error enviando documento desde URL:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SALUD DE LA API ====================

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API WhatsApp funcionando correctamente" });
});

// Verificar estado del bot
app.get("/status", (req, res) => {
  try {
    const info = client.info;
    res.json({
      status: info ? "LISTO" : "NO LISTO",
      info: info
        ? {
            me: info.me?.user || "No disponible",
            pushname: info.pushname || "No disponible",
          }
        : null,
      message: info
        ? "✅ Bot listo para enviar mensajes"
        : "⏳ Escanea el QR y espera...",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(port, () => {
  console.log(`🚀 Servidor API escuchando en el puerto ${port}`);
  console.log(
    "⏳ Iniciando cliente de WhatsApp... (esto puede tardar unos segundos)"
  );
  client.initialize();
});
