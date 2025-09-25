import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap'
import axios from 'axios'

const AdminReports = () => {
  const [reportData, setReportData] = useState({
    appointments: 0,
    cancellations: 0,
    clients: 0,
    revenue: 0,
    appointmentsList: []
  })
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: 'month'
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/reports', { params: filters })
      setReportData(response.data)
      setAlert({ show: true, type: 'success', message: 'Relatório gerado com sucesso!' })
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: 'Erro ao gerar relatório' })
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = async () => {
    try {
      const response = await axios.get('/api/reports/export/pdf', { 
        params: filters,
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: 'Erro ao exportar PDF' })
    }
  }

  const exportExcel = async () => {
    try {
      const response = await axios.get('/api/reports/export/excel', { 
        params: filters,
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: 'Erro ao exportar Excel' })
    }
  }

  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setFilters({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      period: 'month'
    })
  }, [])

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">📊 Relatórios</h2>
          <p className="text-muted">Análise de dados e estatísticas do sistema</p>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">🔍 Filtros</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Período</Form.Label>
                <Form.Select name="period" value={filters.period} onChange={handleFilterChange}>
                  <option value="day">Dia</option>
                  <option value="month">Mês</option>
                  <option value="year">Ano</option>
                  <option value="custom">Personalizado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Inicial</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Final</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" onClick={generateReport} disabled={loading} className="me-2">
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-2">
                <i className="fas fa-calendar-check fa-2x" style={{color: '#FFB6C1'}}></i>
              </div>
              <h3 className="mb-1">{reportData.appointments}</h3>
              <p className="text-muted mb-0">Agendamentos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-2">
                <i className="fas fa-calendar-times fa-2x" style={{color: '#8A2BE2'}}></i>
              </div>
              <h3 className="mb-1">{reportData.cancellations}</h3>
              <p className="text-muted mb-0">Cancelamentos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-2">
                <i className="fas fa-users fa-2x" style={{color: '#AEC6CF'}}></i>
              </div>
              <h3 className="mb-1">{reportData.clients}</h3>
              <p className="text-muted mb-0">Clientes Atendidos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-2">
                <i className="fas fa-dollar-sign fa-2x" style={{color: '#FFB6C1'}}></i>
              </div>
              <h3 className="mb-1">R$ {reportData.revenue.toLocaleString()}</h3>
              <p className="text-muted mb-0">Receita Estimada</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico Simples */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📈 Agendamentos vs Cancelamentos</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Agendamentos</span>
                    <span>{reportData.appointments}</span>
                  </div>
                  <div className="progress mb-2" style={{height: '20px'}}>
                    <div 
                      className="progress-bar" 
                      style={{
                        width: `${(reportData.appointments / (reportData.appointments + reportData.cancellations)) * 100 || 0}%`,
                        background: 'var(--gradient-primary)'
                      }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Cancelamentos</span>
                    <span>{reportData.cancellations}</span>
                  </div>
                  <div className="progress" style={{height: '20px'}}>
                    <div 
                      className="progress-bar" 
                      style={{
                        width: `${(reportData.cancellations / (reportData.appointments + reportData.cancellations)) * 100 || 0}%`,
                        background: 'var(--gradient-accent)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📤 Exportar Relatório</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <p className="text-muted mb-4">Baixe o relatório nos formatos disponíveis</p>
              <Button variant="outline-primary" onClick={exportPDF} className="me-2 mb-2">
                <i className="fas fa-file-pdf me-2"></i>
                Exportar PDF
              </Button>
              <Button variant="outline-secondary" onClick={exportExcel} className="mb-2">
                <i className="fas fa-file-excel me-2"></i>
                Exportar Excel
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabela de Agendamentos */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">📋 Detalhes dos Agendamentos</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {reportData.appointmentsList.length > 0 ? (
                reportData.appointmentsList.map((appointment, index) => (
                  <tr key={index}>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.clientName}</td>
                    <td>{appointment.serviceName}</td>
                    <td>{appointment.professionalName}</td>
                    <td>
                      <span className={`badge ${appointment.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                      </span>
                    </td>
                    <td>R$ {appointment.value?.toLocaleString() || '0'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    Nenhum agendamento encontrado para o período selecionado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default AdminReports