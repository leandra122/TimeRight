const express = require('express');
const PromotionController = require('../controllers/PromotionController');
const authMiddleware = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * /promotions:
 *   get:
 *     summary: Listar todas as promoções
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de promoções
 */
router.get('/', authMiddleware, PromotionController.index);

/**
 * @swagger
 * /promotions/{id}:
 *   get:
 *     summary: Buscar promoção por ID
 *     tags: [Promotions]
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
 *         description: Promoção encontrada
 *       404:
 *         description: Promoção não encontrada
 */
router.get('/:id', authMiddleware, PromotionController.show);

/**
 * @swagger
 * /promotions:
 *   post:
 *     summary: Criar nova promoção
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - validFrom
 *               - validTo
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: decimal
 *               validFrom:
 *                 type: string
 *                 format: date
 *               validTo:
 *                 type: string
 *                 format: date
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Promoção criada com sucesso
 */
router.post('/', authMiddleware, validate(schemas.promotion), PromotionController.store);

/**
 * @swagger
 * /promotions/{id}:
 *   put:
 *     summary: Atualizar promoção
 *     tags: [Promotions]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: decimal
 *               validFrom:
 *                 type: string
 *                 format: date
 *               validTo:
 *                 type: string
 *                 format: date
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Promoção atualizada com sucesso
 *       404:
 *         description: Promoção não encontrada
 */
router.put('/:id', authMiddleware, validate(schemas.promotion), PromotionController.update);

/**
 * @swagger
 * /promotions/{id}:
 *   delete:
 *     summary: Excluir promoção
 *     tags: [Promotions]
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
 *         description: Promoção excluída com sucesso
 *       404:
 *         description: Promoção não encontrada
 */
router.delete('/:id', authMiddleware, PromotionController.destroy);

module.exports = router;