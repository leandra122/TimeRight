const { data, nextId } = require('../data/mockData');

class CategoryController {
  // Listar todas as categorias
  async index(req, res, next) {
    try {
      const categories = data.categories.sort((a, b) => a.name.localeCompare(b.name));
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }

  // Buscar categoria por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const category = data.categories.find(c => c.id === parseInt(id));
      
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
      const category = {
        id: nextId.categories++,
        ...req.body,
        active: req.body.active !== undefined ? req.body.active : true
      };
      data.categories.push(category);
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
      const categoryIndex = data.categories.findIndex(c => c.id === parseInt(id));
      
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...req.body };
      res.json({ 
        message: 'Categoria atualizada com sucesso',
        category: data.categories[categoryIndex] 
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir categoria
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const categoryIndex = data.categories.findIndex(c => c.id === parseInt(id));
      
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      data.categories.splice(categoryIndex, 1);
      res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();