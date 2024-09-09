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

export const validateDiskSpace = (value: string): undefined | string => {
  value = value.toLowerCase();
  if (value.includes("gb")) value = value.replace("gb", "");
  if (isNaN(+value)) return "The disk space should be only in numbers.";
  if (+value > 50) return "The disk space should be lower than 50GB.";
  if (+value < 5) return "The disk space should be bigger than 5GB.";
  return undefined;
};

export const validateMountpoint = (value: string): undefined | string => {
  if (value.length > 100)
    return "The disk mount point should be lower than 100 chars.";
  return undefined;
};

export const validateSelectingNetwork = (choices: any[]) => {
  const isValidChoices = [];
  choices.forEach((choice) => isValidChoices.push(choice.checked));
  const hasTrue = isValidChoices.some((i) => i);
  return hasTrue ? undefined : "You must choose at least one network.";
};
