enum GridErrorMessages{
  NotConnected = "Before accessing this command, please use the 'connect' command to link your account.",
  NotValidMnemonic = "The mnemonic isn't valid, try to use a valid mnemonic.",
  TwinNotExist = "Couldn't find a user for the provided mnemonic on the provided network.",
  Aborted = "Aborted",
  OptionNotValid = "The option is not valid.",
  NotValidNetwork = "Network is not valid, only dev, qa, test and main are supported.",
  MnemonicNotProvided = "The `--mnemonic` option is required when not running in interactive mode, use `-i` to run in interactive mode.",
  SSHNotProvided = "The `--SSH_KEY` option is required when not running in interactive mode, use `-i` to run in interactive mode",
  NetworkNotProvided = "The `--network` option is required when not running in interactive mode, defaulting to `dev`.",
}

enum GridLogMessages{
  // Config logs
  SearchConfigFile = "Searching for the config file...",
  ConfigFound = "Config file found.",
  
  // Grid connection logs 
  ConnectingWallet = "Connecting your wallet.",
  Connected = "Grid client connected successfully.",
  Disconnected = "Grid client Disconnected.",
  TwinCreated = "Config file updated, The twin ID created successfully.",

  // Deployment logs.
  HandleDeployment = "Updating the deployment with the necessary data.",
  DeploymentUpdated = "The deployment updated with the necessary data.",
  Deploying = "Deploying...",
  Deployed = "Deployed.",
  ListDeployment = "Listing the deployment details.",

  // Node logs.
  ListNodes = "Listing the available grid nodes.",
  FilterNodes = "Filtering the grid nodes based on the requirements.",
}

export {
  GridErrorMessages,
  GridLogMessages,
}