interface IGridCliConfig {
  mnemonic: string;
  network: "dev" | "qa" | "test" | "main"
  twinID: string;
  SSH_KEY: string;
  balance: string;
}

interface ITableData {
  headers: string[];
  values: string[];
}

export {
  IGridCliConfig,
  ITableData,
}