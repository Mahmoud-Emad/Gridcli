import { GridClient, KeypairType, NetworkEnv } from "@threefold2/grid_client";
import { IConnectCommandOptions } from "../types";

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
    projectName: "GridCli"
  });
}
