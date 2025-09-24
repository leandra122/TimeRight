import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: email, 2: código + nova senha
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post('http://localhost:8080/api/auth/forgot-password', {
        email: email
      })
      
      setMessage('Código enviado para seu e-mail! Verifique sua caixa de entrada.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
        token: code,
        newPassword: newPassword
      })
      
      setMessage('Senha redefinida com sucesso! Você pode fazer login agora.')
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Header className="text-white text-center">
              <h4 className="mb-0">
                {step === 1 ? '🔐 Recuperar Senha' : '🔑 Nova Senha'}
              </h4>
            </Card.Header>
            <Card.Body style={{padding: '32px'}}>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              {step === 1 ? (
                <Form onSubmit={handleSendCode}>
                  <Form.Group className="mb-3">
                    <Form.Label>E-mail cadastrado</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu e-mail"
                      required
                    />
                    <Form.Text className="text-muted">
                      Enviaremos um código de 6 dígitos para este e-mail
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? '📧 Enviando...' : '📧 Enviar Código'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3">
                    <Form.Label>Código de verificação</Form.Label>
                    <Form.Control
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Digite o código de 6 dígitos"
                      maxLength="6"
                      required
                      style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem'}}
                    />
                    <Form.Text className="text-muted">
                      Código enviado para {email}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nova senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      minLength="6"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar nova senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      minLength="6"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? '🔄 Redefinindo...' : '✅ Redefinir Senha'}
                    </Button>
                    
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      ← Voltar
                    </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-4">
                <Link to="/admin/login" className="text-decoration-none">
                  ← Voltar ao Login Admin
                </Link>
                <span className="mx-2">|</span>
                <Link to="/cliente/login" className="text-decoration-none">
                  Login Cliente
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ForgotPassword