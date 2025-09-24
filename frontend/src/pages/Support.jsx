import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const Support = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axios.post('/api/support', formData);
            setAlert({
                show: true,
                type: 'success',
                message: '✅ Recebemos sua solicitação! Nossa equipe analisará e retornará em breve.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                message: '❌ Erro ao enviar solicitação. Verifique sua conexão e tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className="text-white text-center">
                            <h4 className="mb-0">📞 Suporte TimeRight</h4>
                        </Card.Header>
                        <Card.Body>
                            {alert.show && (
                                <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                                    {alert.message}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nome *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>E-mail *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Assunto *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Mensagem *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={loading}
                                    className="w-100"
                                    size="lg"
                                >
                                    {loading ? '📧 Enviando...' : '🚀 Enviar Solicitação'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Support;