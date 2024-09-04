import inquirer from "inquirer";
import { IConnectCommandOptions } from "../types";
import { validateMnemonic } from "bip39";
import { GridCliConfig } from "../config";
import { GridClient, KeypairType, NetworkEnv } from "@threefold2/grid_client";
import { GridCliLogger } from "../logger";
import { GridErrorMessages, GridLogMessages } from "../logs";

export const connectCommand = {
  command: "connect",
  describe: "Set up the environment by inputting the wallet secret and network into the configuration file.",

  builder: (yargs) => {
    return yargs
      .option("mnemonic", {
        describe: "The mnemonic phrase for your grid client",
        type: "string",
      })
      .option("SSH_KEY", {
        describe: "The public SSH key for accessing deployments.",
        type: "string",
      })
      .option("network", {
        describe: "The network environment.",
        type: "string",
      });
  },

  handler: async (argv) => {
    const { mnemonic: cmdMnemonic = "", SSH_KEY: cmdSSH_KEY = "", network: cmdNetwork = "" } = argv;

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "mnemonic",
        message: "Enter your wallet mnemonic phrase:",
        when: !cmdMnemonic,
        validate: (input) => (validateMnemonic(input) ? true : "Mnemonic is not valid."),
      },
      {
        type: "input",
        name: "SSH_KEY",
        message: "Enter your public SSH key:",
        when: !cmdSSH_KEY,
        validate: (input) => (input.length ? true : "The public SSH key isn't valid."),
      },
      {
        type: "list",
        name: "network",
        message: "Select the network environment:",
        choices: ["dev", "qa", "test", "main"],
        default: cmdNetwork,
        when: !cmdNetwork,
      },
    ]);

    const finalOptions: IConnectCommandOptions = {
      mnemonic: cmdMnemonic || answers.mnemonic,
      network: cmdNetwork || answers.network,
      SSH_KEY: cmdSSH_KEY || answers.SSH_KEY,
    };

    await connect(finalOptions);
    process.exit(0); // Explicitly terminate the process after connection.
  },
};

const connect = async (options: IConnectCommandOptions) => {
  const config = new GridCliConfig();

  const grid = new GridClient({
    mnemonic: options.mnemonic,
    network: options.network as NetworkEnv,
    keypairType: KeypairType.sr25519,
    storeSecret: options.mnemonic,
  });

  try {
    await grid.connect();
  } catch (error: any) {
    await handleGridError(error, grid);
    process.exit(1); // Exit with error status if the connection fails.
  }

  const { balance, twinID } = await fetchGridData(grid);
  config.set({
    balance: balance || "-",
    mnemonic: options.mnemonic,
    network: options.network,
    SSH_KEY: options.SSH_KEY,
    twinID: twinID || "-",
  });

  await grid.disconnect();
  GridCliLogger.success(GridLogMessages.Connected);
};

const handleGridError = async (error: any, grid: GridClient) => {
  if (error.message.includes("TwinNotExistError")) {
    GridCliLogger.error(GridErrorMessages.TwinNotExist);
    
    const { CreateTwin } = await inquirer.prompt({
      type: "input",
      name: "CreateTwin",
      message: "Would you like to create a new one? (y/n)",
      validate: (input) =>
        ["y", "n"].includes(input.toLowerCase()) ? true : "Only available options are `y` or `n`.",
    });

    if (CreateTwin.toLowerCase() === "y") {
      await createNewTwin(grid);
      process.exit(0);
    } else {
      GridCliLogger.error(GridErrorMessages.Aborted);
      process.exit(1);
    }
  } else {
    GridCliLogger.error(error.message);
    process.exit(1);
  }
};

const createNewTwin = async (grid: GridClient) => {
  try {
    const RELAY_STACK = "wss://relay.dev.grid.tf";
    await grid._connect();
    const twin = await grid.twins.create({ relay: RELAY_STACK });
    console.log({ twin });
  } catch (error) {
    GridCliLogger.error(`Error creating twin: ${error.message}`);
    process.exit(1); // Exit with error status if twin creation fails.
  }
};

const fetchGridData = async (grid: GridClient) => {
  let balance = "-";
  let twinID = "-";

  try {
    balance = (await grid.balance.getMyBalance()).free.toFixed();
  } catch {
    GridCliLogger.error("Error fetching balance.");
  }

  try {
    twinID = grid.twinId.toFixed();
  } catch {
    GridCliLogger.error("Error fetching twin ID.");
  }

  return { balance, twinID };
};
