import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    validUntil: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = () => {
    // Dados mockados
    setPromotions([
      {
        id: 1,
        title: 'Corte + Escova',
        description: 'Pacote completo com desconto especial',
        price: 'R$ 89,90',
        validUntil: '2024-12-31'
      },
      {
        id: 2,
        title: 'Hidratação Premium',
        description: 'Tratamento completo para seus cabelos',
        price: 'R$ 129,90',
        validUntil: '2024-12-31'
      }
    ])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editingPromotion) {
        // Simular update
        setPromotions(prev => prev.map(p => 
          p.id === editingPromotion.id ? { ...formData, id: editingPromotion.id } : p
        ))
      } else {
        // Simular create
        const newPromotion = { ...formData, id: Date.now() }
        setPromotions(prev => [...prev, newPromotion])
      }
      
      setShowModal(false)
      setFormData({ title: '', description: '', price: '', validUntil: '' })
      setEditingPromotion(null)
    } catch (error) {
      setError('Erro ao salvar promoção')
    }
    
    setLoading(false)
  }

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion)
    setFormData({ 
      title: promotion.title, 
      description: promotion.description,
      price: promotion.price,
      validUntil: promotion.validUntil
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Deseja excluir esta promoção?')) {
      setPromotions(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gerenciar Promoções</h1>
            <Button onClick={() => setShowModal(true)}>
              Nova Promoção
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descrição</th>
                    <th>Preço</th>
                    <th>Válida até</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map(promotion => (
                    <tr key={promotion.id}>
                      <td>{promotion.title}</td>
                      <td>{promotion.description}</td>
                      <td>{promotion.price}</td>
                      <td>{promotion.validUntil}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="me-2"
                          onClick={() => handleEdit(promotion)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDelete(promotion.id)}
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
            {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Preço</Form.Label>
              <Form.Control
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Válida até</Form.Label>
              <Form.Control
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
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

export default AdminPromotions