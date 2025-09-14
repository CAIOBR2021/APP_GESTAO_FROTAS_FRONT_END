import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Form, Button, Row, Col, Alert, FloatingLabel } from 'react-bootstrap';
import { CalendarEventFill, Save } from 'react-bootstrap-icons';
import type { Entrega } from '../App';

const API_URL = 'http://localhost:3001/api';

interface Suggestions {
  origens: string[];
  destinos: string[];
  items: string[];
  responsaveis: string[];
  telefones: string[];
}

interface DeliveryFormProps {
  onSave: () => void;
  onCancelEdit: () => void;
  deliveryToEdit: Entrega | null;
  suggestions: Suggestions;
}

export function DeliveryForm({
  onSave,
  deliveryToEdit,
  onCancelEdit,
  suggestions,
}: DeliveryFormProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formData, setFormData] = useState({
    local_armazenagem: '',
    local_obra: '',
    item_nome: '',
    item_quantidade: 0,
    item_unidade_medida: 'Unidade',
    responsavel_nome: '',
    responsavel_telefone: '',
  });

  const isEditing = !!deliveryToEdit;

  // Função para formatar o telefone
  const formatPhoneNumber = (value: string) => {
    if (!value) return "";
    const cleanedValue = value.replace(/\D/g, '');
    const match = cleanedValue.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };
  
  useEffect(() => {
    if (deliveryToEdit) {
      const [date, timeWithSeconds] =
        deliveryToEdit.data_hora_solicitacao.split('T');
      const time = timeWithSeconds ? timeWithSeconds.substring(0, 5) : '';
      setFormDate(date);
      setFormTime(time);
      setFormData({
        local_armazenagem: deliveryToEdit.local_armazenagem,
        local_obra: deliveryToEdit.local_obra,
        item_nome: deliveryToEdit.item_nome,
        item_quantidade: deliveryToEdit.item_quantidade,
        item_unidade_medida: deliveryToEdit.item_unidade_medida,
        responsavel_nome: deliveryToEdit.responsavel_nome || '',
        // Aplica a formatação ao carregar para edição
        responsavel_telefone: formatPhoneNumber(deliveryToEdit.responsavel_telefone || ''),
      });
    } else {
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormTime('');
      setFormData({
        local_armazenagem: '',
        local_obra: '',
        item_nome: '',
        item_quantidade: 1,
        item_unidade_medida: 'Unidade',
        responsavel_nome: '',
        responsavel_telefone: '',
      });
    }
  }, [deliveryToEdit]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'responsavel_nome') {
      const responsavelIndex = suggestions.responsaveis.indexOf(value);
      if (responsavelIndex !== -1 && suggestions.telefones[responsavelIndex]) {
        updatedFormData.responsavel_telefone = formatPhoneNumber(suggestions.telefones[responsavelIndex]);
      } else {
        updatedFormData.responsavel_telefone = '';
      }
    } else if (name === 'responsavel_telefone') {
      updatedFormData.responsavel_telefone = formatPhoneNumber(value);
    }
    
    setFormData(updatedFormData);
  };
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const entregaParaSalvar = {
      ...formData,
      data_hora_solicitacao: `${formDate}T${formTime}:00`,
    };

    const url = isEditing
      ? `${API_URL}/entregas/${deliveryToEdit!.id}`
      : `${API_URL}/entregas`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entregaParaSalvar),
      });
      if (!response.ok) throw new Error('Falha na operação com o servidor.');

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      onSave();
    } catch (error) {
      console.error('Erro ao salvar entrega:', error);
      alert('Não foi possível salvar a entrega.');
    }
  };

  return (
    <>
      {showAlert && (
        <Alert variant={isEditing ? 'info' : 'success'}>
          {isEditing
            ? 'Entrega atualizada com sucesso!'
            : 'Entrega agendada com sucesso!'}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <FloatingLabel label="Data">
              <Form.Control
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="Hora">
              <Form.Control
                type="time"
                required
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
              />
            </FloatingLabel>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <FloatingLabel label="Origem">
              <Form.Control
                type="text"
                required
                name="local_armazenagem"
                value={formData.local_armazenagem}
                onChange={handleChange}
                list="origem-list"
                placeholder=" "
              />
              <datalist id="origem-list">
                {suggestions.origens.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="Destino">
              <Form.Control
                type="text"
                required
                name="local_obra"
                value={formData.local_obra}
                onChange={handleChange}
                list="destino-list"
                placeholder=" "
              />
              <datalist id="destino-list">
                {suggestions.destinos.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </FloatingLabel>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <FloatingLabel label="Item">
              <Form.Control
                type="text"
                required
                name="item_nome"
                value={formData.item_nome}
                onChange={handleChange}
                list="item-list"
                placeholder=" "
              />
              <datalist id="item-list">
                {suggestions.items.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <Form.Group>
              <FloatingLabel label="Quantidade">
                <Form.Control
                  type="number"
                  required
                  name="item_quantidade"
                  value={formData.item_quantidade || ''}
                  onChange={handleChange}
                  placeholder=" "
                  min="1"
                />
              </FloatingLabel>
            </Form.Group>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Unidade">
              <Form.Select
                required
                name="item_unidade_medida"
                value={formData.item_unidade_medida}
                onChange={handleChange}
              >
                <option>Unidade</option>
                <option>Caixa</option>
                <option>Peça</option>
                <option>Metro</option>
                <option>Metro Quadrado</option>
                <option>Metro Cúbico</option>
                <option>Kg</option>
                <option>Saco</option>
                <option>Rolo</option>
                <option>Lata</option>
                <option>Kit</option>
                <option>Jogo</option>
                <option>Pacote</option>
                <option>Fardo</option>
                <option>Par</option>
              </Form.Select>
            </FloatingLabel>
          </Col>
        </Row>
        <Row>
          <Col>
            <FloatingLabel label="Responsável (Opcional)" className="mb-3">
              <Form.Control
                type="text"
                name="responsavel_nome"
                value={formData.responsavel_nome || ''}
                onChange={handleChange}
                list="responsavel-list"
                placeholder=" "
              />
              <datalist id="responsavel-list">
                {suggestions.responsaveis.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="Telefone (Opcional)" className="mb-3">
              <Form.Control
                type="text"
                name="responsavel_telefone"
                value={formData.responsavel_telefone || ''}
                onChange={handleChange}
                list="telefone-list"
                placeholder=" "
              />
              <datalist id="telefone-list">
                {suggestions.telefones.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </FloatingLabel>
          </Col>
        </Row>
        <div className="d-flex align-items-center">
          <Button
            variant={isEditing ? 'info' : 'primary'}
            type="submit"
            size="lg"
            className="d-flex align-items-center"
          >
            {isEditing ? (
              <Save className="me-2" />
            ) : (
              <CalendarEventFill className="me-2" />
            )}
            {isEditing ? 'Salvar Alterações' : 'Agendar Entrega'}
          </Button>
          {isEditing && (
            <Button variant="secondary" onClick={onCancelEdit} className="ms-3">
              Cancelar Edição
            </Button>
          )}
        </div>
      </Form>
    </>
  );
}