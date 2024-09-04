interface IConnectCommandOptions {
  mnemonic: string;
  SSH_KEY: string;
  network: "dev" | "qa" | "test" | "main"
}

interface IGridCliConfig extends IConnectCommandOptions {
  twinID: string;
  balance: string;
}

interface ITableData {
  headers: string[];
  values: string[];
}

export {
  IConnectCommandOptions,
  IGridCliConfig,
  ITableData,
}