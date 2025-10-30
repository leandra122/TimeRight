import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const ClientRegister = () => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmPassword: ''
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
        
        if (formData.senha !== formData.confirmPassword) {
            setAlert({
                show: true,
                type: 'danger',
                message: 'As senhas não coincidem'
            });
            return;
        }
        
        if (formData.senha.length < 6) {
            setAlert({
                show: true,
                type: 'danger',
                message: 'Senha deve ter pelo menos 6 caracteres'
            });
            return;
        }
        
        setLoading(true);
        
        try {
            const userData = {
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
                dataCadastro: new Date().toISOString().split('T')[0],
                codStatus: true
            };

            const response = await fetch('http://localhost:8080/api/usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Erro no cadastro');
            }
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Cadastro realizado com sucesso! Redirecionando para login...'
            });
            
            setTimeout(() => {
                navigate('/cliente/login');
            }, 2000);
            
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                message: error.message || 'Erro no cadastro'
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
                                        name="nome"
                                        value={formData.nome}
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
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="senha"
                                        value={formData.senha}
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