import inquirer from "inquirer";
import fs from "fs";
import * as yaml from "js-yaml";
import { DeploymentModel } from "../types";
import { deployDeployment, generateName, getNodeId, parseCPU, parseDiskSpace, parseMemory } from "./shared";
import {
  isPrivateIP,
  validateAlphanumeric,
  validateCPUnit,
  validateDiskSpace,
  validateMemorySpace,
  validateMountpoint,
  validateSelectingNetwork,
} from "../validators";
import { GridCliLogger } from "../logger";
import { GridLogMessages } from "../logs";

const handleDeployPrompt = async () => {
  const defaultMessage = "or press 'Enter' to take the default generated one";
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "networkName",
      message: `Enter your deployment network name, ${defaultMessage}:`,
      default: generateName("net", 5),
      validate: (input) =>
        validateAlphanumeric(input) === undefined
          ? true
          : validateAlphanumeric(input),
    },
    {
      type: "input",
      name: "networkIPRange",
      message: `Enter your deployment network IP range, ${defaultMessage}:`,
      default: "10.10.0.0/16",
      validate: (input) =>
        isPrivateIP(input) === undefined
          ? true
          : isPrivateIP(input),
    },
    {
      type: "input",
      name: "machineName",
      message: `Enter your deployment name, ${defaultMessage}:`,
      default: generateName("vm"),
      validate: (input) =>
        validateAlphanumeric(input) === undefined
          ? true
          : validateAlphanumeric(input),
    },
    {
      type: "input",
      name: "diskSpace",
      message: `Enter the required disk space, ${defaultMessage}:`,
      default: "15GB",
      validate: (input) =>
        validateDiskSpace(input) === undefined
          ? true
          : validateDiskSpace(input),
    },
    {
      type: "input",
      name: "diskName",
      message: `Enter the required disk name, ${defaultMessage}:`,
      default: generateName("dsk", 4),
      validate: (input) =>
        validateAlphanumeric(input) === undefined
          ? true
          : validateAlphanumeric(input),
    },
    {
      type: "input",
      name: "diskMountpoint",
      message: `Enter the required disk mountpoint, ${defaultMessage}:`,
      default: "/mnt/data",
      validate: (input) =>
        validateMountpoint(input) === undefined
          ? true
          : validateMountpoint(input),
    },
    {
      type: "input",
      name: "cpu",
      message: `Enter the required cpu cores, ${defaultMessage}:`,
      default: "1 Core",
      validate: (input) =>
        validateCPUnit(input) === undefined
          ? true
          : validateCPUnit(input),
    },
    {
      type: "input",
      name: "memory",
      message: `Enter the required memory space, ${defaultMessage}:`,
      default: "2GB",
      validate: (input) =>
        validateMemorySpace(input) === undefined
          ? true
          : validateMemorySpace(input),
    },
    {
      type: "checkbox",
      name: "networkAccess",
      message: `Network access: What network would you like to add?`,
      validate: (choices) =>
        validateSelectingNetwork(choices as any) === undefined
          ? true
          : validateSelectingNetwork(choices as any),
      choices: [
        {
          name: "Mycelium network:",
          value: "mycelium",
          checked: true,
          description:
            "Mycelium is an IPv6 overlay network. Each node that joins the overlay network will receive an overlay network IP.",
        },
        {
          name: "Public IP v4",
          value: "publicIp4",
          checked: false,
          description:
            "An Internet Protocol version 4 address that is globally unique and accessible over the internet.",
        },
        {
          name: "Public IP v6",
          value: "publicIp6",
          checked: false,
          description:
            "Public IPv6 is the next-generation Internet Protocol that offers an expanded address space to connect a vast number of devices.",
        },
        {
          name: "Planetary network",
          value: "planetary",
          checked: false,
          description:
            "The Planetary Network is a distributed network infrastructure that spans across multiple regions and countries, providing global connectivity.",
        },
      ],
      default: "mycelium",
    },
  ]);

  let nodeId: number;
  const extraOptions = await inquirer.prompt([
    {
      type: "input",
      name: "filterNodes",
      message: `Specify a node to deploy on, or leave blank to let us choose one based on your specifications.`,
      validate: (input) => isNaN(+input) ? "This field accepts only numbers." : true
    },
  ])

  if (!extraOptions.filterNodes){
    GridCliLogger.info(GridLogMessages.FilterNodes);
    nodeId = await getNodeId(answers);
  } else {
    nodeId = extraOptions.filterNodes 
  }


  const networkAccess = answers.networkAccess as Array<string>
  const deployment = {
    name: answers.machineName,
    network: {
      ip_range: answers.networkIPRange,
      name: answers.networkName,
    },
    machines: [
      {
        name: answers.machineName,
        disks: [
          {
            name: answers.diskName,
            mountpoint: answers.diskMountpoint,
            size: parseDiskSpace(answers.diskSpace),
          }
        ],
        cpu: parseCPU(answers.cpu),
        memory: parseMemory(answers.memory) * 1024,
        mycelium: networkAccess.includes("mycelium"),
        public_ip: networkAccess.includes("publicIp4"),
        public_ip6: networkAccess.includes("publicIp6"),
        planetary: networkAccess.includes("planetary"),
        node_id: nodeId,
      }
    ]
  }

  return await deployDeployment(deployment as DeploymentModel);
};

const handleDeploy = async (argv) => {
  const { deploymentFile } = argv;
  if (deploymentFile) {
    // Check if file exists
    if (!fs.existsSync(deploymentFile)) {
      console.error(`File not found: ${deploymentFile}`);
      process.exit(1);
    }

    // Read and handle the file (replace with actual deployment logic)
    const fileContent = fs.readFileSync(deploymentFile, "utf8");
    const parsedData = yaml.load(fileContent) as DeploymentModel;
    await deployDeployment(parsedData);
  } else return await handleDeployPrompt();
};

const deployCommand = {
  command: "deploy",
  describe: "Deploy a virtual machine using a yaml configuration file.",
  builder: (yargs) => {
    return yargs.option("deployment-file", {
      alias: "f",
      describe: "Path to the deployment configuration yaml file.",
      type: "string",
      demandOption: false,
    });
  },
  handler: handleDeploy,
};

export const vmsCommand = {
  command: "vms <command>",
  describe: "Manage and deploy virtual machines on the grid.",
  builder: (yargs) => {
    return (
      yargs
        .command(deployCommand)
        // .command(listCommand)
        .demandCommand(
          1,
          "You need to specify a valid subcommand like deploy or list"
        )
    );
  },
  handler: () => {},
};
