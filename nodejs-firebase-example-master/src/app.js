const express = require("express");
const path = require("path");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// Configuración específica de CORS
const corsOptions = {
  origin: 'http://tudominio.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(corsOptions));

// Settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.engine(".hbs", exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
}).engine);
app.set("view engine", ".hbs");

// Configuración del transporte de Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hade3051@gmail.com',
    pass: 'aisnjufgvvgwelid'
  }
});

// Función auxiliar para validar el formato del correo electrónico
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Ruta para manejar el envío del formulario de contacto
app.post('/contacto', (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body;

  if (!nombre || !correo || !asunto || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!validateEmail(correo)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido' });
  }

  const mailOptions = {
    from: correo, // El correo proporcionado en los parámetros
    to: 'trestamal@gmail.com', // El correo que recibirá todos los mensajes
    subject: asunto,
    text: `Mensaje de ${nombre}:\n\n${mensaje}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ error: 'No se pudo enviar el correo. Por favor, inténtalo de nuevo más tarde.' });
    }
    console.log('Correo enviado:', info.response);
    res.status(200).json({ message: 'Mensaje enviado con éxito. ¡Gracias por contactarnos!' });
  });
});

// Nueva ruta para manejar el envío del formulario de cita
app.post('/cita', (req, res) => {
  const { 
    precio,
    anio,
    correo,
    fechaDevolucion,
    fechaCompra,
    horaDevolucion,
    horaCompra,
    nombre,
    tipoVehiculo
  } = req.body;

  if (!correo || !nombre) {
    return res.status(400).json({ error: 'El correo y el nombre son obligatorios' });
  }

  if (!validateEmail(correo)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido' });
  }

  const messageBody = `
    Nueva reserva de automóvil:
    
    Nombre: ${nombre}
    Correo: ${correo}
    Tipo de automóvil: ${tipoVehiculo}
    Año del automóvil: ${anio}
    Fecha de inicio: ${fechaCompra}
    Hora de inicio: ${horaCompra}
    Fecha de devolución: ${fechaDevolucion}
    Hora de devolución: ${horaDevolucion}
    A pagar: ${precio}
  `;

  const mailOptions = {
    from: 'hade3051@gmail.com',
    to: 'trestamal@gmail.com',
    subject: 'Nueva reserva de automóvil',
    text: messageBody
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ error: 'No se pudo procesar la reserva. Por favor, inténtalo de nuevo más tarde.' });
    }
    console.log('Correo enviado:', info.response);
    res.status(200).json({ message: 'Reserva recibida con éxito. ¡Gracias por tu reserva!' });
  });
});

// Routes
app.use(require("./routes/index"));

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

module.exports = app;