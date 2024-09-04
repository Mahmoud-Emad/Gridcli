import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { IGridCliConfig } from "../types";

class GridCliConfig implements IGridCliConfig {
  mnemonic: string = "";
  network: "dev" | "qa" | "test" | "main" = "dev";
  SSH_KEY: string = "-";
  balance: string = "-";
  twinID: string = "-";

  private updateEnvironment() {
    const config = {
      mnemonic: this.mnemonic,
      network: this.network,
      SSH_KEY: this.SSH_KEY,
      balance: this.balance,
      twinID: this.twinID
    }
    const configPath = path.join(os.homedir(), ".grid-cli-config.json");
    fs.writeFileSync(configPath, JSON.stringify(
      config
    ), {
      flag: "w"
    });
  }

  load(): IGridCliConfig {
    const configPath = path.join(os.homedir(), ".grid-cli-config.json");
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(data);
      this.mnemonic = config.mnemonic;
      this.network = config.network;
      this.SSH_KEY = config.SSH_KEY;
      this.balance = config.balance;
      this.twinID = config.twinID;

    }
    return {
      mnemonic: this.mnemonic,
      network: this.network,
      SSH_KEY: this.SSH_KEY,
      balance: this.balance,
      twinID: this.twinID,
    }
  }

  set(metadata: IGridCliConfig) {
    this.mnemonic = metadata.mnemonic;
    this.network = metadata.network;
    this.SSH_KEY = metadata.SSH_KEY;
    this.balance = metadata.balance;
    this.twinID = metadata.twinID;
    return this.updateEnvironment();
  }
}

export {
  GridCliConfig,
}
