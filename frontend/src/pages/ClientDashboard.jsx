import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ClientDashboard = () => {
    const [clientData, setClientData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [appointmentForm, setAppointmentForm] = useState({
        professionalId: '',
        categoryId: '',
        appointmentDate: '',
        notes: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('clientToken');
        const client = localStorage.getItem('clientData');
        
        if (!token || !client) {
            navigate('/client-login');
            return;
        }
        
        setClientData(JSON.parse(client));
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            const client = JSON.parse(localStorage.getItem('clientData'));
            const token = localStorage.getItem('clientToken');
            
            // Configurar headers para cliente
            const clientHeaders = {
                'X-Client-Email': client.email,
                'Authorization': `Bearer ${token}`
            };
            
            // Carregar agendamentos
            const appointmentsRes = await api.get('/appointments/my-appointments', {
                headers: clientHeaders
            });
            setAppointments(appointmentsRes.data.appointments || []);
            
            // Carregar categorias e profissionais (endpoints públicos)
            const [categoriesRes, professionalsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/professionals')
            ]);
            
            setCategories(categoriesRes.data.categories || categoriesRes.data || []);
            setProfessionals(professionalsRes.data.professionals || professionalsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            // Se erro de autenticação, redirecionar para login
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('clientToken');
                localStorage.removeItem('clientData');
                navigate('/cliente/login');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        navigate('/');
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const client = JSON.parse(localStorage.getItem('clientData'));
            
            const token = localStorage.getItem('clientToken');
            
            await api.post('/appointments', {
                ...appointmentForm,
                professionalId: parseInt(appointmentForm.professionalId),
                categoryId: parseInt(appointmentForm.categoryId),
                appointmentDate: new Date(appointmentForm.appointmentDate).toISOString()
            }, {
                headers: { 
                    'X-Client-Email': client.email,
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Agendamento realizado com sucesso!'
            });
            
            setShowModal(false);
            setAppointmentForm({ professionalId: '', categoryId: '', appointmentDate: '', notes: '' });
            loadData();
            
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                message: error.response?.data?.error || 'Erro ao realizar agendamento'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'AGENDADO': 'warning',
            'CONFIRMADO': 'success',
            'CANCELADO': 'danger',
            'CONCLUIDO': 'info'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    if (!clientData) {
        return <div>Carregando...</div>;
    }

    return (
        <Container className="py-4">
            {alert.show && (
                <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                    {alert.message}
                </Alert>
            )}
            
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Bem-vinda, {clientData.name}!</h2>
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Sair
                        </Button>
                    </div>
                </Col>
            </Row>
            
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center" style={{padding: '24px'}}>
                        <Card.Body>
                            <h5 style={{fontWeight: 600, marginBottom: '16px'}}>Meus Agendamentos</h5>
                            <h3 className="text-primary" style={{fontSize: '2.5rem', fontWeight: 700}}>{appointments.length}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center" style={{padding: '24px'}}>
                        <Card.Body>
                            <h5 style={{fontWeight: 600, marginBottom: '16px'}}>Próximo Agendamento</h5>
                            <p className="text-muted" style={{fontSize: '14px'}}>
                                {appointments.length > 0 ? 
                                    new Date(appointments[0].appointmentDate).toLocaleDateString() : 
                                    'Nenhum agendamento'
                                }
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center" style={{padding: '24px'}}>
                        <Card.Body>
                            <Button variant="primary" onClick={() => setShowModal(true)} size="lg">
                                Novo Agendamento
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Meus Agendamentos</h5>
                </Card.Header>
                <Card.Body>
                    {appointments.length === 0 ? (
                        <p className="text-muted text-center">Você ainda não possui agendamentos.</p>
                    ) : (
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Serviço</th>
                                    <th>Profissional</th>
                                    <th>Status</th>
                                    <th>Observações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(appointment => (
                                    <tr key={appointment.id}>
                                        <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                                        <td>{appointment.category.name}</td>
                                        <td>{appointment.professional.name}</td>
                                        <td>{getStatusBadge(appointment.status)}</td>
                                        <td>{appointment.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
            
            {/* Modal de Novo Agendamento */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Novo Agendamento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAppointmentSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Serviço</Form.Label>
                                    <Form.Select
                                        value={appointmentForm.categoryId}
                                        onChange={(e) => setAppointmentForm({...appointmentForm, categoryId: e.target.value})}
                                        required
                                    >
                                        <option value="">Selecione um serviço</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Profissional</Form.Label>
                                    <Form.Select
                                        value={appointmentForm.professionalId}
                                        onChange={(e) => setAppointmentForm({...appointmentForm, professionalId: e.target.value})}
                                        required
                                    >
                                        <option value="">Selecione um profissional</option>
                                        {professionals.map(professional => (
                                            <option key={professional.id} value={professional.id}>
                                                {professional.name} - {professional.specialty}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Data e Hora</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={appointmentForm.appointmentDate}
                                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Observações (opcional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={appointmentForm.notes}
                                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                                placeholder="Alguma observação especial?"
                            />
                        </Form.Group>
                        
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Agendando...' : 'Agendar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ClientDashboard;