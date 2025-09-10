import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { professionalsAPI } from '../api/client'

const AdminProfessionals = () => {
  const [professionals, setProfessionals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState(null)
  const [formData, setFormData] = useState({ name: '', specialty: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      const response = await professionalsAPI.getAll()
      setProfessionals(response.data.professionals || [])
    } catch (error) {
      setError('Erro ao carregar profissionais')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editingProfessional) {
        await professionalsAPI.update(editingProfessional.id, formData)
      } else {
        await professionalsAPI.create(formData)
      }
      
      setShowModal(false)
      setFormData({ name: '', specialty: '', phone: '', email: '' })
      setEditingProfessional(null)
      loadProfessionals()
    } catch (error) {
      setError('Erro ao salvar profissional')
    }
    
    setLoading(false)
  }

  const handleEdit = (professional) => {
    setEditingProfessional(professional)
    setFormData({ 
      name: professional.name, 
      specialty: professional.specialty,
      phone: professional.phone,
      email: professional.email
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Deseja excluir este profissional?')) {
      try {
        await professionalsAPI.delete(id)
        loadProfessionals()
      } catch (error) {
        setError('Erro ao excluir profissional')
      }
    }
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gerenciar Profissionais</h1>
            <Button onClick={() => setShowModal(true)}>
              Novo Profissional
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Especialidade</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {professionals.map(professional => (
                    <tr key={professional.id}>
                      <td>{professional.name}</td>
                      <td>{professional.specialty}</td>
                      <td>{professional.phone}</td>
                      <td>{professional.email}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="me-2"
                          onClick={() => handleEdit(professional)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDelete(professional.id)}
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
            {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Especialidade</Form.Label>
              <Form.Control
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
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

export default AdminProfessionals