#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { connectCommand } from './commands/connect';
import { whoamiCommand } from './commands/whoami';
import { vmsCommand } from './commands/vms';

yargs(hideBin(process.argv))
  .strictCommands()
  .command(connectCommand)
  .command(whoamiCommand)
  .command(vmsCommand)
  .help()
  .argv;
