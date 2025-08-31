import React from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import type { Entrega } from '../App';

interface DeliveryTableProps {
  deliveries: Entrega[];
  onDelete: (id: number) => void;
  onEdit: (delivery: Entrega) => void;
  selectedIds: number[];
  onSelectItem: (id: number) => void;
  onSelectAll: (isChecked: boolean) => void;
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries, onDelete, onEdit, selectedIds, onSelectItem, onSelectAll }) => {
  const isAllSelected = deliveries.length > 0 && selectedIds.length === deliveries.length;

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th><Form.Check type="checkbox" title="Selecionar Todos" checked={isAllSelected} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectAll(e.target.checked)} /></th>
          <th>Data/Hora</th>
          <th>Obra</th>
          <th>Item</th>
          <th>Qtd</th>
          <th>Un</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => {
            const isSelected = selectedIds.includes(delivery.id!);
            return (
              <tr key={delivery.id} className={isSelected ? 'table-primary' : ''}>
                <td><Form.Check type="checkbox" checked={isSelected} onChange={() => onSelectItem(delivery.id!)} /></td>
                <td>{new Date(delivery.data_hora_solicitacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{delivery.local_obra}</td>
                <td>{delivery.item_nome}</td>
                <td>{delivery.item_quantidade}</td>
                <td>{delivery.item_unidade_medida}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => onEdit(delivery)} className="me-2" title="Editar"><PencilSquare /></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(delivery.id!)} title="Excluir"><Trash /></Button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr><td colSpan={7} className="text-center">Nenhuma entrega agendada para esta data.</td></tr>
        )}
      </tbody>
    </Table>
  );
};