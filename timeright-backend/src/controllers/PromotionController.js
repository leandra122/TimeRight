const { data, nextId } = require('../data/mockData');
const emailService = require('../services/emailService');

class PromotionController {
  // Listar todas as promoções
  async index(req, res, next) {
    try {
      const promotions = [...data.promotions].sort((a, b) => b.id - a.id);
      res.json({ promotions });
    } catch (error) {
      next(error);
    }
  }

  // Buscar promoção por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const promotion = data.promotions.find(p => p.id === parseInt(id));
      
      if (!promotion) {
        return res.status(404).json({ error: 'Promoção não encontrada' });
      }

      res.json({ promotion });
    } catch (error) {
      next(error);
    }
  }

  // Criar nova promoção
  async store(req, res, next) {
    try {
      const promotion = {
        id: nextId.promotions++,
        ...req.body,
        active: req.body.active !== undefined ? req.body.active : true
      };
      data.promotions.push(promotion);
      
      // Enviar notificação por email
      await emailService.sendNotification('promotion_created', promotion);
      
      res.status(201).json({ 
        message: 'Promoção criada com sucesso',
        promotion 
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar promoção
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const promotionIndex = data.promotions.findIndex(p => p.id === parseInt(id));
      
      if (promotionIndex === -1) {
        return res.status(404).json({ error: 'Promoção não encontrada' });
      }

      data.promotions[promotionIndex] = { ...data.promotions[promotionIndex], ...req.body };

      // Enviar notificação por email
      await emailService.sendNotification('promotion_updated', data.promotions[promotionIndex]);

      res.json({ 
        message: 'Promoção atualizada com sucesso',
        promotion: data.promotions[promotionIndex] 
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir promoção
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const promotionIndex = data.promotions.findIndex(p => p.id === parseInt(id));
      
      if (promotionIndex === -1) {
        return res.status(404).json({ error: 'Promoção não encontrada' });
      }

      data.promotions.splice(promotionIndex, 1);
      res.json({ message: 'Promoção excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();