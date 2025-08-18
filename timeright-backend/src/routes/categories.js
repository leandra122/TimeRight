const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const authMiddleware = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar todas as categorias
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/', authMiddleware, CategoryController.index);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Buscar categoria por ID
 *     tags: [Categories]
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
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/:id', authMiddleware, CategoryController.show);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 */
router.post('/', authMiddleware, validate(schemas.category), CategoryController.store);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags: [Categories]
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
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.put('/:id', authMiddleware, validate(schemas.category), CategoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Excluir categoria
 *     tags: [Categories]
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
 *         description: Categoria excluída com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/:id', authMiddleware, CategoryController.destroy);

module.exports = router;