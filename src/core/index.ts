import yargs from "yargs";
import { GridCliConfig } from "../config";
import { GridErrorMessages, GridLogMessages } from "../logs";
import { GridCliLogger } from "../logger";
import { capitalize } from "../utils";
import { validateMnemonic } from "bip39";
import { NetworkEnv, GridClient, KeypairType } from "@threefold2/grid_client";

class GridCli {
  static async whoami(argv?: yargs.Argv<{}>) {
    try {
      GridCliLogger.info(GridLogMessages.SearchConfigFile);

      const config = new GridCliConfig();
      const values = config.load();

      if (!values.mnemonic) {
        GridCliLogger.error(GridErrorMessages.NotConnected);
        return;
      }

      if (!validateMnemonic(values.mnemonic)) {
        GridCliLogger.error(GridErrorMessages.NotValidMnemonic);
        return;
      }

      GridCliLogger.success(GridLogMessages.ConfigFound);

      const grid = new GridClient({
        mnemonic: values.mnemonic,
        network: values.network as NetworkEnv,
        keypairType: KeypairType.sr25519,
        storeSecret: values.mnemonic,
      });

      await grid.connect();

      const promises = [];

      if (!values.twinID || values.twinID === "-") {
        values.twinID = grid.twinId.toFixed();
      }

      if (!values.SSH_KEY || values.SSH_KEY === "-") {
        promises.push(
          grid.tfchain.backendStorage.load("metadata").then(metadata => {
            values.SSH_KEY = metadata.sshkey || "-";
          })
        );
      }

      if (!values.balance || values.balance === "-") {
        promises.push(
          grid.balance.getMyBalance().then(balance => {
            values.balance = `${balance.free}TFT`;
          })
        );
      }

      await Promise.all(promises);
      await grid.disconnect();

      config.set(values);

      GridCliLogger.logTable({
        headers: Object.keys(values).map(capitalize),
        values: Object.values(values),
      });
    } catch (error) {
      GridCliLogger.error(`An error occurred: ${error.message}`);
    }
  }
}

export { GridCli };
