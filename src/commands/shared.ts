import { GridClient, KeypairType, NetworkEnv } from "@threefold2/grid_client";
import { DeploymentModel, IConnectCommandOptions, IDeployMachinePrompt } from "../types";
import { GridCliConfig } from "../config";
import { GridCliLogger } from "../logger";
import { GridLogMessages } from "../logs";
import { capitalize } from "../utils";

/**
 * Creates a new GridClient instance with the provided options.
 *
 * @param options - The options for connecting to the GridClient.
 * @returns A new GridClient instance configured with the specified options.
 */
export const getGrid = (options: IConnectCommandOptions): GridClient => {
  return new GridClient({
    mnemonic: options.mnemonic,
    network: options.network as NetworkEnv,
    keypairType: KeypairType.sr25519,
    storeSecret: options.mnemonic,
    projectName: "GridCli",
  });
};

/**
 * Deploys a deployment using the Grid-CLI tool.
 * Connects to the wallet, updates deployment data, deploys the machines, lists the deployment details, and disconnects.
 * @param deployment - The deployment model to be deployed.
 */
export const deployDeployment = async (deployment: DeploymentModel) => {
  GridCliLogger.info(GridLogMessages.SearchConfigFile);
  const config = new GridCliConfig();
  const options = config.load();
  GridCliLogger.success(GridLogMessages.ConfigFound);

  GridCliLogger.info(GridLogMessages.ConnectingWallet);
  const grid = getGrid(options);
  await grid.connect();
  GridCliLogger.success(GridLogMessages.Connected);

  GridCliLogger.info(GridLogMessages.HandleDeployment);
  for (const machine of deployment.machines) {
    machine.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
    machine.entrypoint = "/sbin/zinit init";
    machine.env = { SSH_KEY: options.SSH_KEY };
  }
  deployment.description = "Deployment deployed using the Grid-CLI tool.";
  GridCliLogger.success(GridLogMessages.DeploymentUpdated);

  GridCliLogger.info(GridLogMessages.Deploying);
  await grid.machines.deploy(deployment);
  GridCliLogger.success(GridLogMessages.Deployed);

  GridCliLogger.info(GridLogMessages.ListDeployment);
  const dValues = await grid.machines.getObj(deployment.name);

  let machines;
  for (const values of dValues) {
    machines = {
      name: values.name,
      nodeId: values.nodeId,
      contractId: values.contractId,
      publicIPv4: values.publicIP && values.publicIP.ip ? values.publicIP.ip : "-",
      publicIPv6: values.publicIP && values.publicIP.ip6 ? values.publicIP.ip6 : "-",
      myceliumIP: values.myceliumIP,
      planetary: values.planetary,
    };

    console.log("\n");
    GridCliLogger.logTable(
      {
        headers: Object.keys(machines).map(capitalize),
        values: Object.values(machines),
      },
    );
  }

  await grid.disconnect();
  GridCliLogger.info(GridLogMessages.Disconnected)
};

/**
 * Generates a random string of a specified length.
 * 
 * @param length - The length of the generated string (default is 7).
 * @returns A randomly generated string consisting of lowercase letters and numbers.
 */
export function generateName(prefix: string, length = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const allChars = chars + nums

  let str = "";

  for (let i = 0; i < length; i++) {
    str += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return prefix + str
}

/**
 * Retrieves the node ID based on the provided machine deployment specifications.
 * 
 * @param specs - The specifications for deploying the machine.
 * @returns A promise that resolves to the node ID.
 * @throws An error if no matching node is found.
 */
export async function getNodeId(specs: IDeployMachinePrompt): Promise<number> {
  try {
    // Load configuration and initialize the grid client
    const config = new GridCliConfig();
    const options = config.load();
    const grid = getGrid(options);

    // Log wallet connection process
    GridCliLogger.info(GridLogMessages.ConnectingWallet);
    await grid.connect();

    // Filter available nodes based on the deployment specifications
    const nodes = await grid.nodes.filter({
      mru: parseMemory(specs.memory),
      cru: parseCPU(specs.cpu),
      hru: parseDiskSpace(specs.diskSpace),
      publicIPs: specs.networkAccess.includes("publicIp4"),
      hasIPv6: specs.networkAccess.includes("publicIp4"),
    });

    if (nodes.length > 0) {
      return nodes[0].nodeId;
    } else {
      throw new Error('No matching nodes found for the provided specifications.');
    }
  } catch (error) {
    // Handle errors gracefully
    GridCliLogger.error(`Error retrieving node ID: ${error.message}`);
    throw error;
  }
}

/**
 * Parses the memory specification and returns the value in the required format.
 * 
 * @param memory - The memory specification (e.g., "16GB").
 * @returns The parsed memory value.
 */
export function parseMemory(memory: string | number): number {
  return typeof memory === 'string' && memory.includes('GB')
    ? +memory.replace('GB', '')
    : +memory;
}

/**
 * Parses the CPU specification and returns the value in the required format.
 * 
 * @param cpu - The CPU specification (e.g., "4 Core").
 * @returns The parsed CPU value.
 */
export function parseCPU(cpu: string | number): number {
  return typeof cpu === 'string' && (cpu.toLowerCase().includes('core') || cpu.toLowerCase().includes('cores'))
    ? +cpu.trim().replace('core', '')
    : +cpu;
}

/**
 * Parses the disk space specification and returns the value in the required format.
 * 
 * @param diskSpace - The disk space specification (e.g., "500GB").
 * @returns The parsed disk space value.
 */
export function parseDiskSpace(diskSpace: string | number): number {
  return typeof diskSpace === 'string' && diskSpace.includes('GB')
    ? +diskSpace.replace('GB', '')
    : +diskSpace;
}
