export interface EntradaEstoqueRequestDTO {
  produtoId: number;
  quantidade: number;             // min 1
  precoCustoUnitario: number;     // number (ex.: 12.34)
}

export interface EntradaEstoqueResponseDTO {
  id: number;
  produtoId: number;
  quantidade: number;
  precoCustoUnitario: number;
  dataCompra: string;             // ISO
  saldo: number;                  // saldo dessa “lote/entrada”
}
