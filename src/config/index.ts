import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { IGridCliConfig } from "../types";

/**
 * A class for managing the configuration of the Grid CLI application.
 * This class provides methods to load and save configuration settings
 * for the CLI, ensuring that they are stored in a user-friendly format.
 */
class GridCliConfig implements IGridCliConfig {
  mnemonic: string = "";
  network: "dev" | "qa" | "test" | "main" = "dev";
  SSH_KEY: string = "-";
  balance: string = "-";
  twinID: string = "-";

  /**
   * Constructs the path to the configuration file in the user's home directory.
   * @returns {string} The full path to the configuration file.
   */
  private getConfigPath(): string {
    return path.join(os.homedir(), ".config", "grid-cli", "config.json");
  }

  /**
   * Ensures that the configuration directory exists, creating it if necessary.
   * This method checks for the existence of the directory and creates it
   * using recursive creation if it does not exist.
   */
  private ensureConfigDirectoryExists(): void {
    const configDir = path.dirname(this.getConfigPath());
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  /**
   * Writes the provided configuration object to the configuration file.
   * It first ensures that the configuration directory exists before
   * writing the JSON string representation of the config to the file.
   * 
   * @param {IGridCliConfig} config - The configuration object to write to the file.
   */
  private writeConfigFile(config: IGridCliConfig): void {
    this.ensureConfigDirectoryExists();
    fs.writeFileSync(this.getConfigPath(), JSON.stringify(config), { flag: "w" });
  }

  /**
   * Reads the configuration from the configuration file.
   * If the file exists, it parses the JSON data and returns it as an
   * IGridCliConfig object. If the file does not exist, it returns null.
   * 
   * @returns {IGridCliConfig | null} The parsed configuration object or null if the file does not exist.
   */
  private readConfigFile(): IGridCliConfig | null {
    const configPath = this.getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * Loads the configuration from the configuration file and updates the
   * instance properties with the loaded values. If the file does not exist,
   * the instance properties remain unchanged.
   * 
   * @returns {IGridCliConfig} The current instance with updated properties.
   */
  load(): IGridCliConfig {
    const config = this.readConfigFile();
    if (config) {
      Object.assign(this, config);
    }
    return this;
  }

  /**
   * Sets the configuration properties of the instance based on the provided
   * metadata and writes the updated configuration to the configuration file.
   * 
   * @param {IGridCliConfig} metadata - The new configuration values to set.
   */
  set(metadata: IGridCliConfig): void {
    Object.assign(this, metadata);
    this.writeConfigFile(metadata);
  }
}

export { GridCliConfig };
