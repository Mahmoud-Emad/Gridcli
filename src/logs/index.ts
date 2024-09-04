enum GridErrorMessages{
  NotConnected = "💣 - Before accessing this command, please use the 'connect' command to link your account.",
  NotValidMnemonic = "💣 - The mnemonic saved in the config file isn't valid, please re-connect.",
}

enum GridLogMessages{
  SearchConfigFile = "📒 - Searching for the config file...",
  ConfigFound = "✅ - Config file found.",
}

export {
  GridErrorMessages,
  GridLogMessages,
}