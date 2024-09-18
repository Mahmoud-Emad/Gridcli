// File path: ./commands/vms.ts
import inquirer from "inquirer";
import fs from "fs/promises"; // Use async file system methods
import * as yaml from "js-yaml";
import { DeploymentModel, IDeployMachinePrompt } from "../types";
import {
  deployDeployment,
  generateName,
  getNodeId,
  parseCPU,
  parseDiskSpace,
  parseMemory,
} from "./shared";
import {
  isPrivateIP,
  validateAlphanumeric,
  validateCPUnit,
  validateDiskSpace,
  validateMemorySpace,
  validateMountpoint,
  validateNode,
  validateSelectingNetwork,
} from "../validators";
import { GridCliLogger } from "../logger";

// Utility function for validation to avoid repetition
const validateInput = (input, validator, errorMessage) => {
  const validationResult = validator(input);
  if (validationResult) {
    GridCliLogger.error(errorMessage);
    return false;
  }
  return true;
};

const validate = (input, validator) => {
  const validationResult = validator(input);
  return validationResult === undefined ? true : validationResult;
};

// Consolidate validation checks into a function
const validateArgv = (argv) => {
  const validations = [
    {
      condition: argv.networkName,
      validator: validateAlphanumeric,
      error: "The network name should be alphanumeric.",
    },
    {
      condition: argv.networkIPRange,
      validator: isPrivateIP,
      error: "The network IP range should be a private IP.",
    },
    {
      condition: argv.machineName,
      validator: validateAlphanumeric,
      error: "The machine name should be alphanumeric.",
    },
    {
      condition: argv.diskName,
      validator: validateAlphanumeric,
      error: "The disk name should be alphanumeric.",
    },
    {
      condition: argv.diskMountpoint,
      validator: validateMountpoint,
      error: "Invalid disk mountpoint.",
    },
    {
      condition: argv.diskSpace,
      validator: validateDiskSpace,
      error: "Invalid disk space format.",
    },
    {
      condition: argv.cpu,
      validator: validateCPUnit,
      error: "Invalid CPU unit.",
    },
    {
      condition: argv.memory,
      validator: validateMemorySpace,
      error: "Invalid memory format.",
    },
    {
      condition: argv.nodeId,
      validator: validateNode,
      error: "Node ID must be a valid number.",
    },
  ];

  for (const { condition, validator, error } of validations) {
    if (condition && !validateInput(condition, validator, error)) {
      return false;
    }
  }
  return true;
};

const generateDefaults = (argv) => ({
  networkName: argv.networkName || generateName("net", 5),
  networkIPRange: argv.networkIPRange || "10.10.0.0/16",
  machineName: argv.machineName || generateName("vm"),
  diskSpace: argv.diskSpace || "15GB",
  diskName: argv.diskName || generateName("dsk", 4),
  diskMountpoint: argv.diskMountpoint || "/mnt/data",
  cpu: argv.cpu || "1 Core",
  memory: argv.memory || "2GB",
});

// Function to create dynamic questions based on missing argv values
const generateQuestions = (argv, defaults) => {
  const questions = [];

  const prompts = [
    {
      name: "networkName",
      message: "Enter your deployment network name",
      default: defaults.networkName,
      validator: validateAlphanumeric,
    },
    {
      name: "networkIPRange",
      message: "Enter your deployment network IP range",
      default: defaults.networkIPRange,
      validator: isPrivateIP,
    },
    {
      name: "machineName",
      message: "Enter your deployment name",
      default: defaults.machineName,
      validator: validateAlphanumeric,
    },
    {
      name: "diskSpace",
      message: "Enter the required disk space",
      default: defaults.diskSpace,
      validator: validateDiskSpace,
    },
    {
      name: "diskName",
      message: "Enter the required disk name",
      default: defaults.diskName,
      validator: validateAlphanumeric,
    },
    {
      name: "diskMountpoint",
      message: "Enter the required disk mountpoint",
      default: defaults.diskMountpoint,
      validator: validateMountpoint,
    },
    {
      name: "cpu",
      message: "Enter the required CPU cores",
      default: defaults.cpu,
      validator: validateCPUnit,
    },
    {
      name: "memory",
      message: "Enter the required memory space",
      default: defaults.memory,
      validator: validateMemorySpace,
    },
  ];

  for (const { name, message, default: def, validator } of prompts) {
    if (!argv[name]) {
      questions.push({
        type: "input",
        name,
        message: `${message}, or press 'Enter' for default:`,
        default: def,
        validate: (input) => validator(input) === undefined ? true : validator(input),
      });
    }
  }

  return questions;
};

const promptForNodeId = async (specs: IDeployMachinePrompt) => {
  const { filterNodes } = await inquirer.prompt([
    {
      type: "input",
      name: "filterNodes",
      message: `Specify a node to deploy on, or leave blank to let us choose one based on your specifications.`,
      validate: async (input) => validateNode(input), // Use the enhanced validation
    },
  ]);

  return filterNodes || (await getNodeId(specs));
};

const handleDeployPrompt = async (argv) => {
  if (!validateArgv(argv)) return;
  const finalQuestions = [];

  const defaults = generateDefaults(argv);
  const questions = generateQuestions(argv, defaults);

  questions.push({
    type: "checkbox",
    name: "networkAccess",
    message: "Network access: What network would you like to add?",
    validate: (choices) => validate(choices, validateSelectingNetwork),
    choices: [
      { name: "Mycelium network", value: "mycelium", checked: true },
      { name: "Public IP v4", value: "publicIp4", checked: false },
      { name: "Public IP v6", value: "publicIp6", checked: false },
      { name: "Planetary network", value: "planetary", checked: false },
    ],
    default: ["mycelium"],
  });

  const answers = await inquirer.prompt(questions);
  const finalAnswers = { ...argv, ...answers };

  if (!argv.nodeId) {
    finalQuestions.push({
      type: "input",
      name: "filterNodes",
      message: `Specify a node to deploy on, or leave blank to let us choose one based on your specifications.`,
      validate: (input) =>
        input && isNaN(+input) ? "This field accepts only numbers." : true,
    });
  }

  const nodeId = +finalAnswers.nodeId || +(await promptForNodeId(finalAnswers));

  GridCliLogger.info(`Using node ID: ${nodeId}`);

  console.log("finalAnswers.cpu", finalAnswers.cpu)

  const deployment = {
    name: finalAnswers.machineName,
    network: {
      ip_range: finalAnswers.networkIPRange,
      name: finalAnswers.networkName,
    },
    machines: [
      {
        name: finalAnswers.machineName,
        disks: [
          {
            name: finalAnswers.diskName,
            mountpoint: finalAnswers.diskMountpoint,
            size: parseDiskSpace(finalAnswers.diskSpace),
          },
        ],
        cpu: parseCPU(finalAnswers.cpu),
        memory: parseMemory(finalAnswers.memory) * 1024,
        mycelium: finalAnswers.networkAccess.includes("mycelium"),
        public_ip: finalAnswers.networkAccess.includes("publicIp4"),
        public_ip6: finalAnswers.networkAccess.includes("publicIp6"),
        planetary: finalAnswers.networkAccess.includes("planetary"),
        node_id: nodeId,
      },
    ],
  };

  GridCliLogger.info(
    `Deployment configuration prepared: ${JSON.stringify(deployment, null, 2)}`
  );
  return await deployDeployment(deployment as DeploymentModel);
};

const handleDeploy = async (argv) => {
  const { deploymentFile } = argv;
  if (deploymentFile) {
    try {
      const fileContent = await fs.readFile(deploymentFile, "utf8");
      const parsedData = yaml.load(fileContent) as DeploymentModel;
      GridCliLogger.info(
        `Deploying from configuration file: ${deploymentFile}`
      );
      await deployDeployment(parsedData);
    } catch (err) {
      GridCliLogger.error(`Error reading file: ${deploymentFile}`);
      process.exit(1);
    }
  } else {
    GridCliLogger.info("Starting interactive deployment prompt...");
    return await handleDeployPrompt(argv);
  }
};

const deployCommand = {
  command: "deploy",
  describe: "Deploy a virtual machine using a yaml configuration file.",
  builder: (yargs) => {
    return yargs
      .option("deployment-file", {
        alias: "f",
        describe: "Path to the deployment configuration yaml file.",
        type: "string",
        demandOption: false,
      })
      .option("network-name", {
        describe: "Specify the network name.",
        type: "string",
        demandOption: false,
      })
      .option("network-ip-range", {
        describe: "Specify the network IP range.",
        type: "string",
        demandOption: false,
      })
      .option("machine-name", {
        describe: "Specify the machine name.",
        type: "string",
        demandOption: false,
      })
      .option("disk-space", {
        describe: "Specify the required disk space.",
        type: "string",
        demandOption: false,
      })
      .option("disk-name", {
        describe: "Specify the disk name.",
        type: "string",
        demandOption: false,
      })
      .option("disk-mountpoint", {
        describe: "Specify the disk mountpoint.",
        type: "string",
        demandOption: false,
      })
      .option("cpu", {
        describe: "Specify the required CPU cores.",
        type: "string",
        demandOption: false,
      })
      .option("memory", {
        describe: "Specify the required memory space.",
        type: "string",
        demandOption: false,
      })
      .option("node-id", {
        describe: "Specify the node ID to deploy on.",
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
    return yargs
      .command(deployCommand)
      .demandCommand(
        1,
        "You need to specify a valid subcommand like deploy or list"
      );
  },
  handler: () => {},
};
