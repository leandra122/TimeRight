import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/password/forgot`, { email });
            setAlert({
                show: true,
                type: 'success',
                message: 'Código de recuperação enviado para seu e-mail!'
            });
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                message: error.response?.data?.error || 'Erro ao enviar código de recuperação'
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
                            <h4 className="mb-0">Recuperar Senha</h4>
                        </Card.Header>
                        <Card.Body className="p-4">
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Digite seu e-mail cadastrado"
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Enviaremos um código de 6 dígitos para seu e-mail
                                    </Form.Text>
                                </Form.Group>
                                
                                <Button 
                                    type="submit" 
                                    variant="success" 
                                    disabled={loading}
                                    className="w-100 mb-3"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Código'}
                                </Button>
                            </Form>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-decoration-none">
                                    Voltar ao Login
                                </Link>
                                {' | '}
                                <Link to="/reset-password" className="text-decoration-none">
                                    Já tenho o código
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;