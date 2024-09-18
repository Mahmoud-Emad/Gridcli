/**
 * Validates if the input name is alphanumeric.
 *
 * @param name - The name to be validated.
 * @returns Returns undefined if the name is alphanumeric, otherwise returns an error message.
 */
export const validateAlphanumeric = (name: string): undefined | string => {
  var myRegEx = /[^a-z\d]/i;
  var isValid = !myRegEx.test(name);
  return isValid ? undefined : "Name only can be alphanumeric name.";
};

/**
 * Validates the disk space value.
 *
 * @param value - The disk space value to be validated.
 * @returns Returns undefined if the value is valid, otherwise returns a string with an error message.
 */
export function validateDiskSpace(value: string): undefined | string {
  value = value.toLowerCase();
  if (value.includes("gb")) value = value.replace("gb", "");
  if (isNaN(+value)) return "The disk space should be only in numbers.";
  if (+value > 50) return "The disk space should be lower than 50GB.";
  if (+value < 5) return "The disk space should be bigger than 5GB.";
  return undefined;
}

/**
 * Validates the memory space value.
 *
 * @param value - The memory space value to be validated.
 * @returns Returns undefined if the value is valid, otherwise returns a string with an error message.
 */
export function validateMemorySpace(value: string): undefined | string {
  value = value.toLowerCase();
  if (value.includes("gb")) value = value.replace("gb", "");
  if (isNaN(+value)) return "The memory space should be only in numbers.";
  if (+value > 16) return "The memory should be lower than 16GB.";
  if (+value < 1) return "The memory should be bigger than 1GB.";
  return undefined;
}

/**
 * Validates the CPU unit value.
 *
 * @param value - The CPU unit value to be validated.
 * @returns Returns `undefined` if the value is valid, otherwise returns a string describing the validation error.
 */
export function validateCPUnit(value: string): undefined | string {
  value = value.toLowerCase();
  if (value.includes("core")) value = value.replace("core", "");
  if (isNaN(+value)) return "The CPU should be only in numbers.";
  if (+value > 5) return "The CPU should be lower than 5 cores.";
  if (+value < 1) return "The CPU space should be bigger than 1 core.";
  return undefined;
}

/**
 * Validates the provided disk mount point value.
 *
 * @param value - The disk mount point to be validated.
 * @returns Returns `undefined` if the value is valid, otherwise returns a message indicating the validation failure.
 */
export function validateMountpoint(value: string): undefined | string {
  if (value.length > 100)
    return "The disk mount point should be lower than 100 chars.";
  return undefined;
}

/**
 * Validates the selection of networks.
 *
 * @param choices An array of choices representing networks.
 * @returns Returns undefined if at least one network is selected, otherwise returns an error message.
 */
export function validateSelectingNetwork(choices: any[]): string | undefined {
  const isValidChoices = [];
  choices.forEach((choice) => isValidChoices.push(choice.checked));
  const hasTrue = isValidChoices.some((i) => i);
  return hasTrue ? undefined : "You must choose at least one network.";
}

/**
 * Validates if the provided node ID is a valid number.
 *
 * @param {string} nodeId - The node ID to be validated.
 * @returns {string | undefined} A message if the node ID is not a valid number, otherwise undefined.
 */
export function validateNode(nodeId: string): string | undefined {
  if (isNaN(+nodeId)) {
    return "Node ID must be a valid number.";
  }
  return undefined;
}

/**
 * Checks if the given IP address is a private IP address.
 * Private IP addresses are in the ranges 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16.
 *
 * @param ip The IP address to check.
 * @returns Returns "This is not a private ip." if the IP is not private, otherwise returns undefined.
 */
export function isPrivateIP(ip: string): string | undefined {
  const parts = ip.split(".").map(Number);

  // Check if the IP is in 10.0.0.0/8 range
  if (parts[0] === 10) {
    return undefined;
  }

  // Check if the IP is in 172.16.0.0/12 range
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return undefined;
  }

  // Check if the IP is in 192.168.0.0/16 range
  if (parts[0] === 192 && parts[1] === 168) {
    return undefined;
  }

  // If none of the above, it's not a private IP
  return "This is not a private ip.";
}
