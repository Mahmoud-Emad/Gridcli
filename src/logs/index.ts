enum GridErrorMessages{
  NotConnected = "💣 - Before accessing this command, please use the 'connect' command to link your account.",
  NotValidMnemonic = "💣 - The mnemonic saved in the config file isn't valid, please re-connect.",
  TwinNotExist = "💣 - Couldn't find a user for the provided mnemonic on the provided network.",
  Aborted = "💣 - Aborted",
}

enum GridLogMessages{
  SearchConfigFile = "📒 - Searching for the config file...",
  ConfigFound = "✅ - Config file found.",
  Connected = "✅ - Grid client connected successfully.",
  ConnectingWallet = "📒 - Connecting your wallet.",
  TwinCreated = "📒 - Config file updated, The twin ID created successfully.",
}

export {
  GridErrorMessages,
  GridLogMessages,
}