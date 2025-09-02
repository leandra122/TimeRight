const { data, nextId } = require('../data/mockData');
const emailService = require('../services/emailService');

class ScheduleController {
  // Listar horários com filtros opcionais
  async index(req, res, next) {
    try {
      const { professionalId, date, available } = req.query;
      let schedules = data.schedules;
      
      if (professionalId) schedules = schedules.filter(s => s.professionalId === parseInt(professionalId));
      if (date) schedules = schedules.filter(s => s.date === date);
      if (available !== undefined) schedules = schedules.filter(s => s.available === (available === 'true'));

      const schedulesWithProfessional = schedules.map(s => ({
        ...s,
        professional: data.professionals.find(p => p.id === s.professionalId)
      })).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

      res.json({ schedules: schedulesWithProfessional });
    } catch (error) {
      next(error);
    }
  }

  // Buscar horário por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = data.schedules.find(s => s.id === parseInt(id));
      
      if (!schedule) {
        return res.status(404).json({ error: 'Horário não encontrado' });
      }

      const scheduleWithProfessional = {
        ...schedule,
        professional: data.professionals.find(p => p.id === schedule.professionalId)
      };

      res.json({ schedule: scheduleWithProfessional });
    } catch (error) {
      next(error);
    }
  }

  // Criar novo horário
  async store(req, res, next) {
    try {
      const schedule = {
        id: nextId.schedules++,
        ...req.body,
        available: req.body.available !== undefined ? req.body.available : true
      };
      data.schedules.push(schedule);

      const scheduleWithProfessional = {
        ...schedule,
        professional: data.professionals.find(p => p.id === schedule.professionalId)
      };

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
      const scheduleIndex = data.schedules.findIndex(s => s.id === parseInt(id));
      
      if (scheduleIndex === -1) {
        return res.status(404).json({ error: 'Horário não encontrado' });
      }

      data.schedules[scheduleIndex] = { ...data.schedules[scheduleIndex], ...req.body };
      const updatedSchedule = {
        ...data.schedules[scheduleIndex],
        professional: data.professionals.find(p => p.id === data.schedules[scheduleIndex].professionalId)
      };

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
      const scheduleIndex = data.schedules.findIndex(s => s.id === parseInt(id));
      
      if (scheduleIndex === -1) {
        return res.status(404).json({ error: 'Horário não encontrado' });
      }

      data.schedules.splice(scheduleIndex, 1);
      res.json({ message: 'Horário excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();