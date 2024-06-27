const { db } = require("../firebase");
const cors = require('cors');
const { Router } = require("express");
const router = Router();

router.use(cors());


// Endpoint GET para obtener todas las citas
router.get('/citas', async (req, res) => {
  try {
    const querySnapshot = await db.collection("Citas").get(); 
    const citas = querySnapshot.docs.map(doc => ({
      id: doc.id, // Incluir el ID del documento
      ...doc.data() 
    }));
    res.status(200).json(citas); 
  } catch (error) {
    console.error("Error al obtener las citas:", error);
    res.status(500).json({ error: "No se pudieron obtener las citas" });
  }
});

router.post('/contacto2', async (req, res) => {
  try {
    console.log("Recibida solicitud de contacto:", req.body);
    const { nombre, correo, asunto, mensaje } = req.body;
    console.log("Datos extraídos:", { nombre, correo, asunto, mensaje });

    const docRef = await db.collection("Contacto").add({
      firstname: nombre,
      email: correo,
      subject: asunto,
      message: mensaje,
      createdAt: new Date()
    });

    console.log("Documento añadido con ID:", docRef.id);
    res.status(201).json({ message: "Contacto guardado exitosamente", id: docRef.id });
  } catch (error) {
    console.error("Error al guardar el contacto:", error);
    res.status(500).json({ error: "No se pudo guardar el contacto", details: error.message });
  }
});


// Endpoint POST para crear una nueva cita
router.post('/citasnuevas', async (req, res) => {
  try {
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

    // Crea un objeto con los datos de la nueva cita
    const nuevaCita = {
      precio: precio,
      anio: anio,
      correo: correo,
      fechaDevolucion: fechaDevolucion,
      fechaCompra: fechaCompra,
      horaDevolucion: horaDevolucion,
      horaCompra: horaCompra,
      nombre: nombre,
      tipoVehiculo: tipoVehiculo
    };

    // Guarda la nueva cita en la colección "Citas" de Firestore
    const docRef = await db.collection("Citas").add(nuevaCita);

    // Responde con un código 201 y un mensaje de éxito
    res.status(201).json({ message: "Cita creada exitosamente", id: docRef.id });
  } catch (error) {
    // Si hay un error, registra el error y responde con un código 500
    console.error("Error al crear la cita:", error);
    res.status(500).json({ error: "No se pudo crear la cita" });
  }
});

//module.exports = router; 


// Endpoint para consultar todos los usuarios de Usuarios
router.get('/users', async (req, res) => {
  try {
    const querySnapshot = await db.collection("Usuarios2").get();
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      DireccionCorreo: doc.data().DireccionCorreo
    }));
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}); 

// Endpoint para consultar todos los usuarios
router.get('/users2', async (req, res) => {
  try {
    const querySnapshot = await db.collection("Usuarios2")
      .orderBy('fechaCreacion', 'desc') // Ordenar por fecha de creación en orden descendente
      .limit(5) // Limitar a los últimos 5 documentos
      .get();

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      cuenta: doc.data().Cuenta
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// Endpoint para consultar todos los usuarios
router.get('/Qr', async (req, res) => {
  try {
    const querySnapshot = await db.collection("Qr").get();
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      Codigo: doc.data().Codigo,
      Porcentaje: doc.data().Porcentaje,
    }));
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});



// Endpoint para consultar todos los usuarios de Usuarios
router.get('/USER9', async (req, res) => {
  try {
    const querySnapshot = await db.collection("Usuarios").get();
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      Correo: doc.data().Correo,
      Cuenta: doc.data().Cuenta,
      Password: doc.data().Password,
      Rol: doc.data().rol,
    }));
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
// Endpoint para consultar un usuario por su ID
//// Ruta para buscar usuario por correo electrónico
router.get('/byEmail/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const usersRef = db.collection("Usuarios2");
    const snapshot = await usersRef.where("DireccionCorreo", "==", email).get();

    if (snapshot.empty) {
      console.log('No se encontró usuario con ese correo');
      return res.status(404).json({ error: "User not found" });
    }

    let userData;
    snapshot.forEach(doc => {
      userData = doc.data();
    });

    res.status(200).json({
      cuenta: userData.Cuenta,
      DireccionCorreo: userData.DireccionCorreo,
      NombreCompleto: userData.NombreCompleto,
      rol: userData.Rol,
      telefono: userData.Telefono,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


// Endpoint para registrar un nuevo usuario
router.post("/register", async (req, res) => {
  console.log("Received registration request:", req.body);
  const { fullName, account, email, password, phone } = req.body;
  const role = "Usuario";

  try {
    console.log("Attempting to add user to database");
    const docRef = await db.collection("Usuarios2").add({
      NombreCompleto: fullName,
      DireccionCorreo: email,
      Cuenta: account,
      Password: password,
      Telefono: phone,
      Rol: role
    });
    console.log("User added successfully with ID:", docRef.id);
    res.status(201).json({ message: "User registered successfully!", userId: docRef.id });
  } catch (error) {
    console.error("Error registering user:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Failed to register user", 
      details: error.message,
      stack: error.stack
    });
  }
});


//////Ejemplo de video, TODO LO QUE ESTA ABAJO ES DEL EJEMPLO DEL VIDEO
router.get("/", async (req, res) => {
  try {
    const querySnapshot = await db.collection("contacts").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("index", { contacts });
  } catch (error) {
    console.error(error);
  }
});

router.post("/new-contact", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  await db.collection("contacts").add({
    firstname,
    lastname,
    email,
    phone,
  });
  res.redirect("/");
});

router.get("/delete-contact/:id", async (req, res) => {
  await db.collection("contacts").doc(req.params.id).delete();
  res.redirect("/");
});

router.get("/edit-contact/:id", async (req, res) => {
  const doc = await db.collection("contacts").doc(req.params.id).get();
  res.render("index", { contact: { id: doc.id, ...doc.data() } });
});

router.post("/update-contact/:id", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  const { id } = req.params;
  await db
    .collection("contacts")
    .doc(id)
    .update({ firstname, lastname, email, phone });
  res.redirect("/");
});

module.exports = router;
