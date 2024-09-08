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

const listNodes = async (argv) => {
  const config = new GridCliConfig();
  const options = config.load();
  const grid = getGrid(options)
  await grid.connect();
  const nodes = await grid.capacity.getNodes();

  let nodeInfo;
  for (const node of nodes){
    nodeInfo = {
      nodeId: node.nodeId,
      farmId: node.farmId,
      healthy: node.healthy,
      rentable: node.rentable,
      CPU: node.total_resources.cru.toString() + " CPU",
      Memory: formatResourceSize(node.total_resources.mru - node.used_resources.mru),
      HDD: formatResourceSize(node.total_resources.hru - node.used_resources.hru),
      SSD: formatResourceSize(node.total_resources.sru - node.used_resources.sru),
      status: node.status,
      country: node.location.country,
    }

    GridCliLogger.logTable(
      {
        headers: Object.keys(nodeInfo).map(capitalize),
        values: Object.values(nodeInfo),
      },
    );
  }
  await grid.disconnect();
  process.exit(0)
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
      .command(listCommand)
      .demandCommand(1, 'You need to specify a valid subcommand like deploy or list');
  },
  handler: () => {},
};

export const nodesCommand = {
  command: 'nodes <command>',
  describe: 'Logs some information about the grid nodes on a specific network.',
  builder: (yargs) => {
    return yargs
      .command(listCommand)
      // .demandCommand(1, 'You need to specify a valid subcommand like deploy or list');
  },
  handler: () => {},
};

const listCommand = {
  command: 'list',
  describe: 'List all nodes based on the selected network.',
  handler: listNodes
};