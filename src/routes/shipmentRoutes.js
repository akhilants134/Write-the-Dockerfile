const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

router.get('/', shipmentController.getAllShipments);
router.get('/:trackingId', shipmentController.getShipmentByTrackingId);
router.post('/', shipmentController.createShipment);
router.patch('/:trackingId', shipmentController.updateShipment);

module.exports = router;
