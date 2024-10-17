import inquirer from "inquirer";
import { IConnectCommandOptions, IGridTwin } from "../types";
import { validateMnemonic } from "bip39";
import { GridCliConfig } from "../config";
import { GridClient, NetworkEnv } from "@threefold2/grid_client";
import { GridCliLogger } from "../logger";
import { GridErrorMessages, GridLogMessages } from "../logs";
import { whoami } from "./whoami";
import { getGrid } from "./shared";
import { OptionMissingError, ValidationError, NotValidOptionError } from "../errors/index";


const ALL_NETWORKS = ["dev", "qa", "test", "main"];

/**
 * Command to configure the environment by inputting wallet mnemonic, SSH key, and network details.
 * Supports both interactive and non-interactive modes. Additionally, allows setting individual config
 * options via command-line arguments.
 */
export const connectCommand = {
  command: "connect",
  describe: "Set up the environment by inputting the wallet secret and network into the configuration file.",
  
  builder: (yargs) => yargs
    .option("interactive", {
      describe: "Run the command in interactive mode.",
      type: "boolean",
      alias: 'i',
      default: false,
    })
    .option("mnemonic", {
      describe: "The mnemonic phrase for your grid client.",
      type: "string",
      alias: 'm',
    })
    .option("SSH_KEY", {
      describe: "The public SSH key for accessing deployments.",
      type: "string",
      alias: 'k',
    })
    .option("network", {
      describe: "The network environment (e.g., dev, qa, test, main).",
      type: "string",
      alias: 'n',
    })
    .option("set", {
      describe: "Set a key/value pair in the configuration file (e.g., --set network=dev).",
      type: "string",
      alias: 's',
    }),

      /**
   * Handles the connect command logic for both interactive and non-interactive modes.
   * @param argv - The command arguments.
   */
  handler: async (argv) => {
    const userInput = await processUserInput(argv);
    await connectAndTerminate(argv, userInput);
  },

  // /**
  //  * Command handler to process the connect command.
  //  * Supports both interactive and non-interactive modes.
  //  * @param argv - The command arguments.
  //  */
  // handler: async (argv) => {
  //   const {
  //     interactive: cmdInteractive = false,
  //     mnemonic: cmdMnemonic = "",
  //     SSH_KEY: cmdSSH_KEY = "",
  //     set: cmdSet = "",
  //     network: cmdNetwork = ""
  //   } = argv;
    
  //   let userInput: IConnectCommandOptions = {
  //     mnemonic: "",
  //     SSH_KEY: "-",
  //     network: "dev"
  //   };

  //   // Handle interactive mode
  //   if (cmdInteractive) {
  //     userInput = await getUserInput(cmdMnemonic, cmdSSH_KEY, cmdNetwork);
  //     return connectAndTerminate(argv, userInput);
  //   }

  //   // Handle setting configuration via --set option
  //   if (cmdSet) {
  //     let cmdSet_ = cmdSet
  //     if (!Array.isArray(cmdSet)){
  //       cmdSet_ = [cmdSet]
  //     }

  //     for (const element of cmdSet_) {
  //       let [key, value] = element.split('=');
  //       if (Object.keys(userInput).includes(key)){
  //         const savedConfig = checkSavedConfig();
  //         Reflect.set(savedConfig, key, value);
  //         userInput = savedConfig
  //       } else {
  //         throw new NotValidOptionError(GridErrorMessages.OptionNotValid);
  //       }
  //     }
  //     return connectAndTerminate(argv, userInput);
  //   }

  //   // Assign non-interactive inputs to userInput
  //   userInput.mnemonic = cmdMnemonic;
  //   userInput.SSH_KEY = cmdSSH_KEY || userInput.SSH_KEY;
  //   userInput.network = cmdNetwork || userInput.network;

  //   return connectAndTerminate(argv, userInput);
  // },
};

/**
 * Processes the command-line or interactive user input and returns the configuration.
 * @param argv - The command arguments.
 * @returns A Promise resolving to the user input configuration.
 */
const processUserInput = async (argv: any): Promise<IConnectCommandOptions> => {
  const {
    interactive: cmdInteractive = false,
    mnemonic: cmdMnemonic = "",
    SSH_KEY: cmdSSH_KEY = "",
    set: cmdSet = "",
    network: cmdNetwork = "",
  } = argv;

  let userInput: IConnectCommandOptions = {
    mnemonic: cmdMnemonic || "",
    SSH_KEY: cmdSSH_KEY || "-",
    network: cmdNetwork || "dev",
  };

  if (cmdInteractive) {
    return await getUserInput(cmdMnemonic, cmdSSH_KEY, cmdNetwork);
  }

  if (cmdSet) {
    userInput = handleSetOption(cmdSet, userInput);
  }

  return userInput;
};

/**
 * Handles the `--set` option to update configuration key-value pairs.
 * @param cmdSet - The `--set` argument value.
 * @param userInput - The current user input configuration.
 * @returns Updated user input with set values applied.
 */
const handleSetOption = (cmdSet: string, userInput: IConnectCommandOptions): IConnectCommandOptions => {
  const setOptions = Array.isArray(cmdSet) ? cmdSet : [cmdSet];
  
  setOptions.forEach((element) => {
    const [key, value] = element.split("=");
    if (Object.keys(userInput).includes(key)) {
      const savedConfig = checkSavedConfig();
      Reflect.set(savedConfig, key, value);
      userInput = savedConfig;
    } else {
      throw new NotValidOptionError(GridErrorMessages.OptionNotValid);
    }
  });

  return userInput;
};

/**
 * Prompts the user for input in interactive mode.
 * @param mnemonic - Mnemonic provided by command line or empty string if none.
 * @param sshKey - SSH key provided by command line or empty string if none.
 * @param network - Network provided by command line or empty string if none.
 * @returns User input for the connect command as an object.
 */
const getUserInput = async (mnemonic: string, sshKey: string, network: string): Promise<IConnectCommandOptions> => {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "mnemonic",
        message: "Enter your wallet mnemonic phrase:",
        validate: (input) => (validateMnemonic(input) ? true : "Mnemonic is not valid."),
        default: mnemonic,
      },
      {
        type: "input",
        name: "SSH_KEY",
        message: "Enter your public SSH key:",
        validate: (input) => (input.length ? true : "The public SSH key isn't valid."),
        default: sshKey,
      },
      {
        type: "list",
        name: "network",
        message: "Select the network environment:",
        choices: ALL_NETWORKS,
        default: network || "dev",
      },
    ]);

    return {
      mnemonic: answers.mnemonic,
      SSH_KEY: answers.SSH_KEY,
      network: answers.network,
    };
  } catch (error) {
    if (error.name === "ExitPromptError") {
      GridCliLogger.warn("Session closed. You can run the command again when ready.");
      process.exit(0);
    }
    throw error;
  }
};


/**
 * Connects to the Grid network and saves the configuration.
 * @param options - The connection configuration options.
 */
const connect = async (options: IConnectCommandOptions) => {
  validateOptions(options);

  const grid = getGrid(options);

  try {
    await grid.connect();
  } catch (error) {
    await handleGridError(error, grid, options);
  }

  const { balance, twinID } = await fetchGridData(grid);

  // Save the config
  const config = new GridCliConfig();
  config.set({
    balance: balance || "-",
    mnemonic: options.mnemonic,
    network: options.network,
    SSH_KEY: options.SSH_KEY,
    twinID: twinID || "-",
  });

  GridCliLogger.success(GridLogMessages.Connected);
};

/**
 * Validates the connection options.
 * @param options - The connection configuration options.
 */
const validateOptions = (options: IConnectCommandOptions) => {
  if (!options.mnemonic) {
    throw new OptionMissingError(GridErrorMessages.MnemonicNotProvided);
  }

  if (!validateMnemonic(options.mnemonic)) {
    throw new ValidationError(GridErrorMessages.NotValidMnemonic);
  }

  if (!options.SSH_KEY) {
    GridCliLogger.warn(GridErrorMessages.SSHNotProvided);
  }

  if (!options.network) {
    GridCliLogger.warn(GridErrorMessages.NetworkNotProvided);
  }

  if (options.network && !ALL_NETWORKS.includes(options.network)) {
    throw new ValidationError(GridErrorMessages.NotValidNetwork);
  }
};

/**
 * Handles any errors that occur during the connection process.
 * @param error - The encountered error.
 * @param grid - The Grid client instance.
 * @param options - The connection options used.
 */
const handleGridError = async (error: any, grid: GridClient, options: IConnectCommandOptions) => {
  if (error.message.includes("TwinNotExistError")) {
    GridCliLogger.error(GridErrorMessages.TwinNotExist);

    const { CreateTwin } = await inquirer.prompt({
      type: "confirm",
      name: "CreateTwin",
      message: "Your twin does not exist. Would you like to create a new one?",
      default: true,
    });

    if (CreateTwin) {
      await createNewTwin(grid, options);
      GridCliLogger.success(GridLogMessages.TwinCreated);
    } else {
      GridCliLogger.error(GridErrorMessages.Aborted);
      process.exit(1);
    }
  } else {
    GridCliLogger.error(error.message);
    process.exit(1);
  }
};

/**
 * Creates a new twin on the Grid network if one does not already exist.
 * @param grid - The Grid client instance.
 * @param options - The connection options.
 * @returns The newly created twin.
 */
const createNewTwin = async (grid: GridClient, options: IConnectCommandOptions): Promise<IGridTwin> => {
  try {
    await grid._connect();
    const relay = grid.getDefaultUrls(options.network as NetworkEnv).relay.slice(6);
    const twin = await grid.tfchain.activateAccountAndCreateTwin(options.mnemonic, relay);
    return twin;
  } catch (error) {
    GridCliLogger.error(`Error creating twin: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Fetches Grid-related data such as balance and twin ID from the connected Grid client.
 * @param grid - The Grid client instance.
 * @returns An object containing the user's balance and twin ID.
 */
const fetchGridData = async (grid: GridClient) => {
  await grid.connect();
  let balance = "-";
  let twinID = "-";

  try {
    balance = (await grid.balance.getMyBalance()).free.toFixed();
  } catch (error) {
    GridCliLogger.error(`Error fetching balance: ${error.message}`);
  }

  try {
    twinID = grid.twinId.toFixed();
  } catch (error) {
    GridCliLogger.error(`Error fetching twin ID: ${error.message}`);
  }

  await grid.disconnect();
  return { balance, twinID };
};


/**
 * Retrieves and loads the current configuration file.
 * @returns The loaded configuration object.
 */
const checkSavedConfig = (): IConnectCommandOptions => {
  const config = new GridCliConfig();
  return config.load();
};

/**
 * Connects to the Grid network and terminates the process once completed.
 * @param argv - Command arguments passed to the process.
 * @param userInput - The user input configuration options.
 */
const connectAndTerminate = async (argv, userInput: IConnectCommandOptions) => {
  GridCliLogger.info(GridLogMessages.ConnectingWallet);
  await connect(userInput);
  whoami(argv);
  process.exit(0);
};
