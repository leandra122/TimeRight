import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [formData, setFormData] = useState({ 
    date: '', 
    time: '', 
    client: '', 
    service: '',
    professional: '',
    status: 'Agendado'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = () => {
    // Dados mockados
    setSchedules([
      {
        id: 1,
        date: '2024-01-15',
        time: '14:00',
        client: 'Ana Silva',
        service: 'Corte + Escova',
        professional: 'Maria Silva',
        status: 'Agendado'
      },
      {
        id: 2,
        date: '2024-01-15',
        time: '16:00',
        client: 'João Santos',
        service: 'Coloração',
        professional: 'João Santos',
        status: 'Confirmado'
      }
    ])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editingSchedule) {
        setSchedules(prev => prev.map(s => 
          s.id === editingSchedule.id ? { ...formData, id: editingSchedule.id } : s
        ))
      } else {
        const newSchedule = { ...formData, id: Date.now() }
        setSchedules(prev => [...prev, newSchedule])
      }
      
      setShowModal(false)
      setFormData({ date: '', time: '', client: '', service: '', professional: '', status: 'Agendado' })
      setEditingSchedule(null)
    } catch (error) {
      setError('Erro ao salvar agendamento')
    }
    
    setLoading(false)
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({ 
      date: schedule.date, 
      time: schedule.time,
      client: schedule.client,
      service: schedule.service,
      professional: schedule.professional,
      status: schedule.status
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Deseja excluir este agendamento?')) {
      setSchedules(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gerenciar Agendamentos</h1>
            <Button onClick={() => setShowModal(true)}>
              Novo Agendamento
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Profissional</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(schedule => (
                    <tr key={schedule.id}>
                      <td>{schedule.date}</td>
                      <td>{schedule.time}</td>
                      <td>{schedule.client}</td>
                      <td>{schedule.service}</td>
                      <td>{schedule.professional}</td>
                      <td>
                        <span className={`badge ${
                          schedule.status === 'Confirmado' ? 'bg-success' : 
                          schedule.status === 'Agendado' ? 'bg-primary' : 'bg-warning'
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="me-2"
                          onClick={() => handleEdit(schedule)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Horário</Form.Label>
              <Form.Control
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Serviço</Form.Label>
              <Form.Control
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Profissional</Form.Label>
              <Form.Control
                type="text"
                value={formData.professional}
                onChange={(e) => setFormData({...formData, professional: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default AdminSchedules