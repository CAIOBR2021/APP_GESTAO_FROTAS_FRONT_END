import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Navbar,
  Form,
  Button,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CalendarPlus,
  ClipboardData,
  ListTask,
  Truck,
} from 'react-bootstrap-icons';
import { DeliveryForm } from './components/DeliveryForm';
import { DeliveryTable } from './components/DeliveryTable';

export interface Entrega {
  id?: number;
  data_hora_solicitacao: string;
  local_armazenagem: string;
  local_obra: string;
  item_nome: string;
  item_quantidade: number;
  item_unidade_medida: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  status?: string;
}

const API_URL = 'http://localhost:3001/api';

function App() {
  const [deliveries, setDeliveries] = useState<Entrega[]>([]);
  const [editingDelivery, setEditingDelivery] = useState<Entrega | null>(null);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${API_URL}/entregas`);
      if (!response.ok) throw new Error('Erro na API');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Falha ao buscar entregas:', error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);
  
  useEffect(() => {
    setSelectedIds([]);
  }, [filterDate]);

  const handleDelete = async (id: number) => {
    if (window.confirm(`Tem certeza que deseja excluir a entrega?`)) {
      try {
        await fetch(`${API_URL}/entregas/${id}`, { method: 'DELETE' });
        fetchDeliveries();
      } catch (error) {
        console.error('Erro ao excluir entrega:', error);
      }
    }
  };

  const handleEdit = (delivery: Entrega) => {
    setEditingDelivery(delivery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => setEditingDelivery(null);
  const handleSave = () => {
    setEditingDelivery(null);
    fetchDeliveries();
  };

  // --- CORREÇÃO APLICADA AQUI ---
  const sortedAndFilteredDeliveries = useMemo(() => {
    return deliveries
      // Garante que a comparação seja feita apenas com a parte da data (YYYY-MM-DD)
      .filter((d) => d.data_hora_solicitacao.substring(0, 10) === filterDate)
      .sort((a, b) => new Date(a.data_hora_solicitacao).getTime() - new Date(b.data_hora_solicitacao).getTime());
  }, [deliveries, filterDate]);
  // --- FIM DA CORREÇÃO ---

  const formSuggestions = useMemo(() => {
    const origens = [...new Set(deliveries.map(d => d.local_armazenagem))];
    const destinos = [...new Set(deliveries.map(d => d.local_obra))];
    const items = [...new Set(deliveries.map(d => d.item_nome))];
    const responsaveis = [...new Set(deliveries.map(d => d.responsavel_nome).filter(Boolean))] as string[];
    const telefones = [...new Set(deliveries.map(d => d.responsavel_telefone).filter(Boolean))] as string[];
    return { origens, destinos, items, responsaveis, telefones };
  }, [deliveries]);

  const handleSelectItem = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    setSelectedIds(isChecked ? sortedAndFilteredDeliveries.map(d => d.id!) : []);
  };

  const handleGenerateReport = () => {
    if (selectedIds.length === 0) {
      alert('Por favor, selecione ao menos uma entrega para gerar o relatório.');
      return;
    }

    const deliveriesForReport = deliveries
      .filter(d => selectedIds.includes(d.id!))
      .sort((a, b) => new Date(a.data_hora_solicitacao).getTime() - new Date(b.data_hora_solicitacao).getTime());

    const doc = new jsPDF('l', 'mm', 'a4');
    const reportDate = new Date(`${filterDate}T12:00:00`).toLocaleDateString('pt-BR');

    doc.setFontSize(16);
    doc.text('Programação de Caminhões para Entrega de Materiais', 14, 15);
    doc.setFontSize(10);
    doc.text(`Relatório do Dia: ${reportDate}`, 14, 22);

    const tableHead = [['Nº', 'Hora', 'Local da Obra', 'Material', 'Qtd', 'Un', 'Armazem', 'Responsável', 'Telefone']];
    const tableBody = deliveriesForReport.map((delivery, index) => [
      index + 1,
      new Date(delivery.data_hora_solicitacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      delivery.local_obra,
      delivery.item_nome,
      delivery.item_quantidade,
      delivery.item_unidade_medida,
      delivery.local_armazenagem,
      delivery.responsavel_nome || '',
      delivery.responsavel_telefone || '',
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 28,
      theme: 'striped',
      headStyles: { fillColor: [41, 45, 50] },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    const linhaY = finalY + 20;
    const textoY = linhaY + 5;

    doc.line(doc.internal.pageSize.getWidth() / 2 - 50, linhaY, doc.internal.pageSize.getWidth() / 2 + 50, linhaY);
    doc.setFontSize(10);
    doc.text('Assinatura do Motorista', doc.internal.pageSize.getWidth() / 2, textoY, { align: 'center' });

    doc.save(`Programacao-Diaria-${reportDate}.pdf`);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <Truck size={34} className="me-3" />
            Programação de Caminhões para Entrega de Materiais
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Card className="mb-4">
          <Card.Header as="h2" className="h5 d-flex align-items-center">
            <CalendarPlus className="me-2" />
            {editingDelivery ? `Editando Entrega (ID: ${editingDelivery.id})` : 'Agendar Nova Entrega'}
          </Card.Header>
          <Card.Body>
            <DeliveryForm
              onSave={handleSave}
              deliveryToEdit={editingDelivery}
              onCancelEdit={handleCancelEdit}
              suggestions={formSuggestions}
            />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Row className="align-items-center">
              <Col md={6}>
                <h2 className="h5 mb-0 d-flex align-items-center">
                  <ListTask className="me-2" /> Entregas Agendadas
                </h2>
              </Col>
              <Col md={6} className="d-flex justify-content-end">
                <Form.Group controlId="filterDate" className="me-2" style={{ width: '180px' }}>
                  <Form.Control type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                </Form.Group>
                <Button variant="success" onClick={handleGenerateReport} disabled={selectedIds.length === 0}>
                  <ClipboardData className="me-2" />
                  Relatório
                </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <DeliveryTable
              deliveries={sortedAndFilteredDeliveries}
              onDelete={handleDelete}
              onEdit={handleEdit}
              selectedIds={selectedIds}
              onSelectItem={handleSelectItem}
              onSelectAll={handleSelectAll}
            />
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default App;

