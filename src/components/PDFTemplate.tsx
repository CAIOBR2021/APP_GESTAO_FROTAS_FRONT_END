import React from 'react';
import type { Entrega } from '../App';
import { Container, Row, Col } from 'react-bootstrap';

export const PDFTemplate = React.forwardRef<HTMLDivElement, { delivery: Entrega }>(({ delivery }, ref) => {
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div ref={ref} style={{ padding: '20px', backgroundColor: 'white', color: 'black', width: '210mm' }}>
      <Container>
        <Row className="border-bottom pb-3 mb-3 text-center">
          <Col>
            <h1 className="h3">SGRM Transportes</h1>
            <p className="lead mb-0">ORDEM DE TRANSPORTE DE MATERIAL</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <h2 className="h5 border-bottom pb-1 mb-2">Detalhes da Solicitação</h2>
            <p><strong>Data e Hora da Solicitação:</strong> {formatDateTime(delivery.data_hora_solicitacao)}</p>
            <p><strong>Local de Armazenagem (Origem):</strong> {delivery.local_armazenagem}</p>
            <p><strong>Local da Obra (Destino):</strong> {delivery.local_obra}</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <h2 className="h5 border-bottom pb-1 mb-2">Material Transportado</h2>
            <p><strong>Item:</strong> {delivery.item_nome}</p>
            <p><strong>Quantidade:</strong> {delivery.item_quantidade}</p>
            <p><strong>Unidade de Medida:</strong> {delivery.item_unidade_medida}</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <h2 className="h5 border-bottom pb-1 mb-2">Contato na Obra</h2>
            <p><strong>Responsável pela Obra:</strong> {delivery.responsavel_nome || 'Não informado'}</p>
            <p><strong>Telefone do Responsável:</strong> {delivery.responsavel_telefone || 'Não informado'}</p>
          </Col>
        </Row>

        <Row style={{ marginTop: '100px' }}>
          <Col className="text-center">
            <div style={{ borderTop: '1px solid black', paddingTop: '5px', margin: '0 auto', width: '250px' }}>
              Nome do Motorista
            </div>
          </Col>
          <Col className="text-center">
            <div style={{ borderTop: '1px solid black', paddingTop: '5px', margin: '0 auto', width: '250px' }}>
              Data da Entrega
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
});