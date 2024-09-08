enum GridErrorMessages{
  NotConnected = "💣 - Before accessing this command, please use the 'connect' command to link your account.",
  NotValidMnemonic = "💣 - The mnemonic saved in the config file isn't valid, please re-connect.",
  TwinNotExist = "💣 - Couldn't find a user for the provided mnemonic on the provided network.",
  Aborted = "💣 - Aborted",
}

enum GridLogMessages{
  // Config logs
  SearchConfigFile = "📒 - Searching for the config file...",
  ConfigFound = "✅ - Config file found.",
  
  // Grid connection logs 
  ConnectingWallet = "📒 - Connecting your wallet.",
  Connected = "✅ - Grid client connected successfully.",
  Disconnected = "✅ - Grid client Disconnected.",
  TwinCreated = "📒 - Config file updated, The twin ID created successfully.",

  // Deployment logs.
  HandleDeployment = "📒 - Updating the deployment with the necessary data.",
  DeploymentUpdated = "📒 - The deployment with the necessary data.",
  Deploying = "📒 - Deploying...",
  Deployed = "✅ - Deployed.",
  ListDeployment = "📒 - Listing the deployment details.",

  // Node logs.
  ListNodes = "📒 - Listing the available grid nodes.",
}

export {
  GridErrorMessages,
  GridLogMessages,
}