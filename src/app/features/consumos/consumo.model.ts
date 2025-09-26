export interface ConsumoRequestDTO {
  clienteId: number;
  produtoId: number;
  quantidade: number;
}

export interface ConsumoResponseDTO {
  id: number;
  clienteId: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  dataHora: string;
  pago: boolean;
  entradaEstoqueId: number;
}

/** Resposta de GET /consumos/detalhar-conta/{clienteId} */
export interface DetalheContaDTO {
  clienteId: number;
  nomeCliente: string;
  perfil: 'COMUM' | 'SOCIO' | 'PARCEIRO' | string;
  itens: ItemConsumoDTO[];
  total: number;
}

export interface ItemConsumoDTO {
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  dataHora: string; // ISO
}
