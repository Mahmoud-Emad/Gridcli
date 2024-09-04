import { validateMnemonic } from 'bip39';
import { GridCliConfig } from '../config';
import { GridCliLogger } from '../logger';
import { GridErrorMessages, GridLogMessages } from '../logs';
import { capitalize } from '../utils';
import yargs from 'yargs';

export const whoamiCommand = {
  command: 'whoami',
  describe: 'Prints general information about the configured environment.',
  handler: (argv) => whoami(argv),
};

const whoami = async (argv?: yargs.Argv<{}>) => {
  try {
    GridCliLogger.info(GridLogMessages.SearchConfigFile);

    const config = new GridCliConfig();
    const values = config.load();

    if (!values.mnemonic) {
      GridCliLogger.error(GridErrorMessages.NotConnected);
      process.exit(1);
    }

    if (!validateMnemonic(values.mnemonic)) {
      GridCliLogger.error(GridErrorMessages.NotValidMnemonic);
      process.exit(1);
    }

    GridCliLogger.success(GridLogMessages.ConfigFound);

    // if (!values.SSH_KEY || values.SSH_KEY === "-") {
    //   promises.push(
    //     grid.tfchain.backendStorage.load("metadata").then(metadata => {
    //       values.SSH_KEY = metadata.sshkey || "-";
    //     })
    //   );
    // }

    GridCliLogger.logTable({
      headers: Object.keys(values).map(capitalize),
      values: Object.values(values),
    });
    process.exit(1);
  } catch (error) {
    GridCliLogger.error(`An error occurred: ${error.message}`);
  }
}
