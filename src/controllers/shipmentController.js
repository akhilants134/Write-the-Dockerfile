const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllShipments = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getShipmentByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const shipment = await prisma.shipment.findUnique({
      where: { trackingId }
    });
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createShipment = async (req, res) => {
  try {
    const shipment = await prisma.shipment.create({
      data: req.body
    });
    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateShipment = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const shipment = await prisma.shipment.update({
      where: { trackingId },
      data: req.body
    });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllShipments,
  getShipmentByTrackingId,
  createShipment,
  updateShipment
};
