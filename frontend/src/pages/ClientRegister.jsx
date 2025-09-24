import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
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
        
        if (formData.password !== formData.confirmPassword) {
            setAlert({
                show: true,
                type: 'danger',
                message: 'As senhas não coincidem'
            });
            return;
        }
        
        setLoading(true);
        
        try {
            await axios.post('/api/client/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Cadastro realizado com sucesso! Redirecionando para login...'
            });
            
            setTimeout(() => {
                navigate('/cliente/login');
            }, 2000);
            
        } catch (error) {
            let errorMessage = 'Erro ao realizar cadastro';
            
            if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
                errorMessage = 'Servidor indisponível. Tente novamente em alguns instantes.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            setAlert({
                show: true,
                type: 'danger',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <Card className="shadow">
                        <Card.Header className="text-white text-center">
                            <h4 className="mb-0">Cadastro de Cliente</h4>
                        </Card.Header>
                        <Card.Body style={{padding: '32px'}}>
                            {alert.show && (
                                <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                                    {alert.message}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                
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
                                    <Form.Label>Telefone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(11) 99999-9999"
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
                                        minLength="6"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        minLength="6"
                                        required
                                    />
                                </Form.Group>
                                
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={loading}
                                    className="w-100 mb-3"
                                >
                                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                                </Button>
                            </Form>
                            
                            <div className="text-center">
                                <span>Já tem conta? </span>
                                <Link to="/cliente/login" className="text-decoration-none">
                                    Faça login
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ClientRegister;