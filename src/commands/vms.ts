import fs from 'fs';
import * as yaml from 'js-yaml';
import { DeploymentModel } from '../types';
import { deployDeployment, getGrid } from './shared';
import { GridCliConfig } from '../config';
import { GridCliLogger } from '../logger';
import { capitalize, formatResourceSize } from '../utils';


const handleDeploy = async (argv) => {
  const { deploymentFile } = argv;
  if(deploymentFile){
    // Check if file exists
    if (!fs.existsSync(deploymentFile)) {
      console.error(`File not found: ${deploymentFile}`);
      process.exit(1);
    }

    // Read and handle the file (replace with actual deployment logic)
    const fileContent = fs.readFileSync(deploymentFile, 'utf8');
    const parsedData = yaml.load(fileContent) as DeploymentModel;
    await deployDeployment(parsedData)
    // console.log(`Deploying VM using config from file: ${deploymentFile}`);
    // console.log(`File content: ${parsedData.name}`);
  }
}

const deployCommand = {
  command: 'deploy',
  describe: 'Deploy a virtual machine using a yaml configuration file.',
  builder: (yargs) => {
    return yargs.option('deployment-file', {
      alias: 'f',
      describe: 'Path to the deployment configuration yaml file.',
      type: 'string',
      demandOption: false,
    });
  },
  handler: handleDeploy
};

export const vmsCommand = {
  command: 'vms <command>',
  describe: 'Manage and deploy virtual machines on the grid.',
  builder: (yargs) => {
    return yargs
      .command(deployCommand)
      // .command(listCommand)
      .demandCommand(1, 'You need to specify a valid subcommand like deploy or list');
  },
  handler: () => {},
};

