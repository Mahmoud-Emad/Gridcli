#!/usr/bin/env node

import { whoamiCommand } from "./commands/whoami";

whoamiCommand();

// yargs(hideBin(process.argv))
//   .command(
//     'whoami',
//     'Prints general information about the configured environment.',
//     (argv) => GridCli.whoami(argv)
//   )
//   .help()
//   .argv;
  
// import yargs from 'yargs';
// import { hideBin } from 'yargs/helpers';
// import chalk from 'chalk';

// yargs(hideBin(process.argv))
//   .command(
//     'greet [name]',
//     'Greet the user by name',
//     (yargs) => {
//       return yargs.positional('name', {
//         describe: 'Name to greet',
//         default: 'World',
//       });
//     },
//     (argv) => {
//       console.log(chalk.green(`Hello, ${argv.name}!`));
//     }
//   )
//   .help()
//   .argv;
