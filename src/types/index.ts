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

interface IGridTwin {
  public_key: string,
  mnemonic: string,
  twinId: number
}

interface DeploymentModel {
  name: string;
  network: {
    name: string;
    ip_range: string;
  };
  machines: Array<{
    name: string;
    node_id: number;
    disks: Array<{
      name: string;
      size: number;
      mountpoint: string;
    }>;
    public_ip: boolean;
    public_ip6: boolean;
    planetary: boolean;
    mycelium: boolean;
    cpu: number;
    memory: number;
    rootfs_size: number;
    flist: string;
    entrypoint: string;
    env: {
      SSH_KEY: string;
    };
  }>;
  metadata: string;
  description: string;
}

export {
  IConnectCommandOptions,
  IGridCliConfig,
  ITableData,
  IGridTwin,
  DeploymentModel,
}