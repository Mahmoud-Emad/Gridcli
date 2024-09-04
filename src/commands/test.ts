export const testCommand = {
  command: 'test',
  describe: 'Prints general information about the configured environment.',
  handler: (argv) => {
    console.log('Test command executed');
  },
};
