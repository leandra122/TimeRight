const express = require('express');
const ProfessionalController = require('../controllers/ProfessionalController');
const authMiddleware = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * /professionals:
 *   get:
 *     summary: Listar todos os profissionais
 *     tags: [Professionals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profissionais
 */
router.get('/', authMiddleware, ProfessionalController.index);

/**
 * @swagger
 * /professionals/{id}:
 *   get:
 *     summary: Buscar profissional por ID
 *     tags: [Professionals]
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
 *         description: Profissional encontrado
 *       404:
 *         description: Profissional não encontrado
 */
router.get('/:id', authMiddleware, ProfessionalController.show);

/**
 * @swagger
 * /professionals:
 *   post:
 *     summary: Criar novo profissional
 *     tags: [Professionals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - specialty
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               photo:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Profissional criado com sucesso
 */
router.post('/', authMiddleware, validate(schemas.professional), ProfessionalController.store);

/**
 * @swagger
 * /professionals/{id}:
 *   put:
 *     summary: Atualizar profissional
 *     tags: [Professionals]
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
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               photo:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *       404:
 *         description: Profissional não encontrado
 */
router.put('/:id', authMiddleware, validate(schemas.professional), ProfessionalController.update);

/**
 * @swagger
 * /professionals/{id}:
 *   delete:
 *     summary: Excluir profissional
 *     tags: [Professionals]
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
 *         description: Profissional excluído com sucesso
 *       404:
 *         description: Profissional não encontrado
 */
router.delete('/:id', authMiddleware, ProfessionalController.destroy);

module.exports = router;