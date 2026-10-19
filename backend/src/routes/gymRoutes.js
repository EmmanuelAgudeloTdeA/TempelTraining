const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  listUsuarios,
  updateUsuario,
  createUsuario,
  listSocios,
  getSocioById,
  createSocio,
  listMembresias,
  createMembresia,
  updateMembresia,
  deleteMembresia,
  assignMembership,
  listProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  listVentas,
  createVenta,
  listReservas,
  createReserva,
  updateReserva,
  listVisitantes,
  registerVisitor,
  getReportes,
  listRecepcionistas
} = require('../controllers/gymController');

const router = express.Router();

router.get('/usuarios', authMiddleware, roleMiddleware(['administrador']), listUsuarios);
router.post('/usuarios', authMiddleware, roleMiddleware(['administrador']), createUsuario);
router.put('/usuarios/:id', authMiddleware, roleMiddleware(['administrador']), updateUsuario);

router.get('/socios', authMiddleware, listSocios);
router.get('/socios/:id', authMiddleware, getSocioById);
router.post('/socios', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), createSocio);

router.get('/membresias', authMiddleware, listMembresias);
router.post('/membresias', authMiddleware, roleMiddleware(['administrador']), createMembresia);
router.put('/membresias/:id', authMiddleware, roleMiddleware(['administrador']), updateMembresia);
router.delete('/membresias/:id', authMiddleware, roleMiddleware(['administrador']), deleteMembresia);
router.post('/membresias/asignar', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), assignMembership);

router.get('/productos', authMiddleware, listProductos);
router.post('/productos', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), createProducto);
router.put('/productos/:id', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), updateProducto);
router.delete('/productos/:id', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), deleteProducto);

router.get('/ventas', authMiddleware, listVentas);
router.post('/ventas', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), createVenta);

router.get('/reservas', authMiddleware, listReservas);
router.post('/reservas', authMiddleware, createReserva);
router.put('/reservas/:id', authMiddleware, updateReserva);

router.get('/visitantes', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), listVisitantes);
router.post('/visitantes', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), registerVisitor);

router.get('/reportes', authMiddleware, roleMiddleware(['administrador']), getReportes);
router.get('/usuarios/recepcionistas', authMiddleware, roleMiddleware(['administrador', 'recepcionista']), listRecepcionistas);

module.exports = router;
