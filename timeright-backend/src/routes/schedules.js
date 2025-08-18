const express = require('express');
const ScheduleController = require('../controllers/ScheduleController');
const authMiddleware = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Listar horários com filtros opcionais
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: integer
 *         description: Filtrar por profissional
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filtrar por disponibilidade
 *     responses:
 *       200:
 *         description: Lista de horários
 */
router.get('/', authMiddleware, ScheduleController.index);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Buscar horário por ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Horário encontrado
 *       404:
 *         description: Horário não encontrado
 */
router.get('/:id', authMiddleware, ScheduleController.show);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Criar novo horário
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - professionalId
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               professionalId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: '09:00'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: '10:00'
 *               available:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Horário criado com sucesso
 */
router.post('/', authMiddleware, validate(schemas.schedule), ScheduleController.store);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Atualizar horário
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               professionalId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Horário atualizado com sucesso
 *       404:
 *         description: Horário não encontrado
 */
router.put('/:id', authMiddleware, validate(schemas.schedule), ScheduleController.update);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Excluir horário
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Horário excluído com sucesso
 *       404:
 *         description: Horário não encontrado
 */
router.delete('/:id', authMiddleware, ScheduleController.destroy);

module.exports = router;