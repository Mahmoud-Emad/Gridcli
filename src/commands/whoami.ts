import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { GridCli } from '../core';

const whoamiCommand = () => yargs(hideBin(process.argv))
  .command(
    'whoami',
    'Prints general information about the configured environment.',
    (argv) => GridCli.whoami(argv)
  )
  .help()
  .argv;

export {
  whoamiCommand
}
