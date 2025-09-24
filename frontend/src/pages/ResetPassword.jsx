import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        token: '',
        newPassword: '',
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
        
        if (formData.newPassword !== formData.confirmPassword) {
            setAlert({
                show: true,
                type: 'danger',
                message: 'As senhas não coincidem'
            });
            return;
        }
        
        setLoading(true);
        
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/password/reset`, {
                token: formData.token,
                newPassword: formData.newPassword
            });
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Senha redefinida com sucesso! Redirecionando...'
            });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                message: error.response?.data?.error || 'Erro ao redefinir senha'
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
                        <Card.Header className="bg-success text-white text-center">
                            <h4 className="mb-0">Redefinir Senha</h4>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {alert.show && (
                                <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                                    {alert.message}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Código de Recuperação</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="token"
                                        value={formData.token}
                                        onChange={handleChange}
                                        placeholder="Digite o código de 6 dígitos"
                                        maxLength="6"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Nova Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Digite sua nova senha"
                                        minLength="6"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Nova Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirme sua nova senha"
                                        minLength="6"
                                        required
                                    />
                                </Form.Group>
                                
                                <Button 
                                    type="submit" 
                                    variant="success" 
                                    disabled={loading}
                                    className="w-100 mb-3"
                                >
                                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                                </Button>
                            </Form>
                            
                            <div className="text-center">
                                <Link to="/forgot-password" className="text-decoration-none">
                                    Solicitar novo código
                                </Link>
                                {' | '}
                                <Link to="/login" className="text-decoration-none">
                                    Voltar ao Login
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPassword;