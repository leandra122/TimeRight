const { Promotion } = require('../models');
const emailService = require('../services/emailService');

class PromotionController {
  // Listar todas as promoções
  async index(req, res, next) {
    try {
      const promotions = await Promotion.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json({ promotions });
    } catch (error) {
      next(error);
    }
  }

  // Buscar promoção por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findByPk(id);
      
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
      const promotion = await Promotion.create(req.body);
      
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
      const promotion = await Promotion.findByPk(id);
      
      if (!promotion) {
        return res.status(404).json({ error: 'Promoção não encontrada' });
      }

      await promotion.update(req.body);

      // Enviar notificação por email
      await emailService.sendNotification('promotion_updated', promotion);

      res.json({ 
        message: 'Promoção atualizada com sucesso',
        promotion 
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir promoção
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findByPk(id);
      
      if (!promotion) {
        return res.status(404).json({ error: 'Promoção não encontrada' });
      }

      await promotion.destroy();
      res.json({ message: 'Promoção excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();