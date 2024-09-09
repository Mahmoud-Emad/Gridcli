import inquirer from "inquirer";
import fs from "fs";
import * as yaml from "js-yaml";
import { DeploymentModel } from "../types";
import { deployDeployment, generateName, getGrid } from "./shared";
import {
  validateAlphanumeric,
  validateDiskSpace,
  validateMountpoint,
  validateSelectingNetwork,
} from "../validators";
import { GridCliConfig } from "../config";
import { GridCliLogger } from "../logger";
import { capitalize, formatResourceSize } from "../utils";

const handleDeployPrompt = async () => {
  const defaultMessage = "or press 'Enter' to take the default generated one";
  const answers = await inquirer.prompt([
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
      default: "10GB",
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
      type: "checkbox",
      name: "public_ip",
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
          // disabled: "The 'Mycelium network' option is enabled by default.",
          description:
            "Mycelium is an IPv6 overlay network. Each node that joins the overlay network will receive an overlay network IP.",
        },
        {
          name: "Public IP v4",
          value: "publicIp",
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
      // default: "mnt/data",
      // validate: (input) => (validateMountpoint(input) === undefined ? true : validateMountpoint(input)),
    },
  ]);
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
