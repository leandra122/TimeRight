import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const navigate = useNavigate();

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
            const response = await axios.post('http://localhost:8080/api/client/login', formData);
            
            // Salvar dados do cliente no localStorage
            localStorage.setItem('clientToken', response.data.token);
            localStorage.setItem('clientData', JSON.stringify(response.data.client));
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Login realizado com sucesso! Redirecionando...'
            });
            
            setTimeout(() => {
                navigate('/cliente/dashboard');
            }, 1500);
            
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                message: error.response?.data?.error || 'Erro ao fazer login'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow">
                        <Card.Header className="text-white text-center">
                            <h4 className="mb-0">Login do Cliente</h4>
                        </Card.Header>
                        <Card.Body className="p-4" style={{padding: '32px !important'}}>
                            {alert.show && (
                                <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                                    {alert.message}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={loading}
                                    className="w-100 mb-3"
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </Button>
                            </Form>
                            
                            <div className="text-center">
                                <Link to="/forgot-password" className="text-decoration-none d-block mb-2">
                                    Esqueceu sua senha?
                                </Link>
                                <span>Não tem conta? </span>
                                <Link to="/cliente/cadastro" className="text-decoration-none">
                                    Cadastre-se
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ClientLogin;