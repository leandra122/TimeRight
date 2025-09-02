const { data, nextId } = require('../data/mockData');
const emailService = require('../services/emailService');

class ProfessionalController {
  // Listar todos os profissionais
  async index(req, res, next) {
    try {
      const professionals = data.professionals.map(p => ({
        ...p,
        category: data.categories.find(c => c.id === p.categoryId)
      })).sort((a, b) => a.name.localeCompare(b.name));
      res.json({ professionals });
    } catch (error) {
      next(error);
    }
  }

  // Buscar profissional por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const professional = data.professionals.find(p => p.id === parseInt(id));
      
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      const professionalWithCategory = {
        ...professional,
        category: data.categories.find(c => c.id === professional.categoryId)
      };

      res.json({ professional: professionalWithCategory });
    } catch (error) {
      next(error);
    }
  }

  // Criar novo profissional
  async store(req, res, next) {
    try {
      const professional = {
        id: nextId.professionals++,
        ...req.body,
        active: req.body.active !== undefined ? req.body.active : true
      };
      data.professionals.push(professional);
      
      const professionalWithCategory = {
        ...professional,
        category: data.categories.find(c => c.id === professional.categoryId)
      };
      
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
      const professionalIndex = data.professionals.findIndex(p => p.id === parseInt(id));
      
      if (professionalIndex === -1) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      data.professionals[professionalIndex] = { ...data.professionals[professionalIndex], ...req.body };
      const updatedProfessional = {
        ...data.professionals[professionalIndex],
        category: data.categories.find(c => c.id === data.professionals[professionalIndex].categoryId)
      };

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
      const professionalIndex = data.professionals.findIndex(p => p.id === parseInt(id));
      
      if (professionalIndex === -1) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      data.professionals.splice(professionalIndex, 1);
      res.json({ message: 'Profissional excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfessionalController();