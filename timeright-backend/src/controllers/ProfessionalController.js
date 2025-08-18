const { Professional, Category } = require('../models');
const emailService = require('../services/emailService');

class ProfessionalController {
  // Listar todos os profissionais
  async index(req, res, next) {
    try {
      const professionals = await Professional.findAll({
        include: [{ model: Category, as: 'category' }],
        order: [['name', 'ASC']]
      });
      res.json({ professionals });
    } catch (error) {
      next(error);
    }
  }

  // Buscar profissional por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const professional = await Professional.findByPk(id, {
        include: [{ model: Category, as: 'category' }]
      });
      
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      res.json({ professional });
    } catch (error) {
      next(error);
    }
  }

  // Criar novo profissional
  async store(req, res, next) {
    try {
      const professional = await Professional.create(req.body);
      const professionalWithCategory = await Professional.findByPk(professional.id, {
        include: [{ model: Category, as: 'category' }]
      });
      
      // Enviar notificação por email
      await emailService.sendNotification('professional_created', professionalWithCategory);
      
      res.status(201).json({ 
        message: 'Profissional criado com sucesso',
        professional: professionalWithCategory 
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar profissional
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const professional = await Professional.findByPk(id);
      
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      await professional.update(req.body);
      const updatedProfessional = await Professional.findByPk(id, {
        include: [{ model: Category, as: 'category' }]
      });

      // Enviar notificação por email
      await emailService.sendNotification('professional_updated', updatedProfessional);

      res.json({ 
        message: 'Profissional atualizado com sucesso',
        professional: updatedProfessional 
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir profissional
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const professional = await Professional.findByPk(id);
      
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      await professional.destroy();
      res.json({ message: 'Profissional excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfessionalController();