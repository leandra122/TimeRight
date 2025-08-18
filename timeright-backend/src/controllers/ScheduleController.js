const { Schedule, Professional } = require('../models');
const emailService = require('../services/emailService');

class ScheduleController {
  // Listar horários com filtros opcionais
  async index(req, res, next) {
    try {
      const { professionalId, date, available } = req.query;
      const where = {};
      
      if (professionalId) where.professionalId = professionalId;
      if (date) where.date = date;
      if (available !== undefined) where.available = available === 'true';

      const schedules = await Schedule.findAll({
        where,
        include: [{ model: Professional, as: 'professional' }],
        order: [['date', 'ASC'], ['startTime', 'ASC']]
      });

      res.json({ schedules });
    } catch (error) {
      next(error);
    }
  }

  // Buscar horário por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findByPk(id, {
        include: [{ model: Professional, as: 'professional' }]
      });
      
      if (!schedule) {
        return res.status(404).json({ error: 'Horário não encontrado' });
      }

      res.json({ schedule });
    } catch (error) {
      next(error);
    }
  }

  // Criar novo horário
  async store(req, res, next) {
    try {
      const schedule = await Schedule.create(req.body);
      const scheduleWithProfessional = await Schedule.findByPk(schedule.id, {
        include: [{ model: Professional, as: 'professional' }]
      });

      // Enviar notificação por email
      await emailService.sendNotification('schedule_created', scheduleWithProfessional);
      
      res.status(201).json({ 
        message: 'Horário criado com sucesso',
        schedule: scheduleWithProfessional 
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar horário
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findByPk(id);
      
      if (!schedule) {
        return res.status(404).json({ error: 'Horário não encontrado' });
      }

      await schedule.update(req.body);
      const updatedSchedule = await Schedule.findByPk(id, {
        include: [{ model: Professional, as: 'professional' }]
      });

      // Enviar notificação por email
      await emailService.sendNotification('schedule_updated', updatedSchedule);

      res.json({ 
        message: 'Horário atualizado com sucesso',
        schedule: updatedSchedule 
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir horário
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findByPk(id);
      
      if (!schedule) {
        return res.status(404).json({ error: 'Horário não encontrado' });
      }

      await schedule.destroy();
      res.json({ message: 'Horário excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();