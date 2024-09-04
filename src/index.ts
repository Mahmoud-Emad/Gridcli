#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { connectCommand } from './commands/connect';
import { whoamiCommand } from './commands/whoami';
import { testCommand } from './commands/test';

yargs(hideBin(process.argv))
  .strictCommands()
  .command(connectCommand)
  .command(whoamiCommand)
  .command(testCommand)
  .help()
  .argv;
