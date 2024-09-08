import { GridCliConfig } from "../config";
import { getGrid } from "./shared";
import { capitalize, formatResourceSize } from "../utils";
import { GridCliLogger } from "../logger";
import { GridLogMessages } from "../logs";

const listNodes = async (argv) => {
  const config = new GridCliConfig();
  const options = config.load();
  const grid = getGrid(options)
  GridCliLogger.info(GridLogMessages.ConnectingWallet)
  await grid.connect();
  GridCliLogger.info(GridLogMessages.Connected)
  GridCliLogger.info(GridLogMessages.ListNodes)
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
  GridCliLogger.info(GridLogMessages.Disconnected)
  process.exit(0)
}

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
