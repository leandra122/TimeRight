const { Category } = require('../models');

class CategoryController {
  // Listar todas as categorias
  async index(req, res, next) {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']]
      });
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }

  // Buscar categoria por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ category });
    } catch (error) {
      next(error);
    }
  }

  // Criar nova categoria
  async store(req, res, next) {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({ 
        message: 'Categoria criada com sucesso',
        category 
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar categoria
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await category.update(req.body);
      res.json({ 
        message: 'Categoria atualizada com sucesso',
        category 
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir categoria
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await category.destroy();
      res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();