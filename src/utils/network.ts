import { MetaMask } from "@web3-react/metamask";
import { WalletConnect } from "@web3-react/walletconnect";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { initializeConnector } from "@web3-react/core";
import { ENetwork, EWallet } from "src/types";

type TWalletConnector =
    | typeof MetaMask
    | typeof CoinbaseWallet
    | typeof WalletConnect;

const options = {
    appName: "PayMeMatic",
    url: `https://${process.env.NETX_PUBLIC_VERCEL_URL || `localhost:7000`}`,
};
export const Wallet: Record<EWallet, TWalletConnector> = {
    metamask: MetaMask,
    coinbase: CoinbaseWallet,
    walletconnect: WalletConnect,
};

export const initConnector = (wallet: EWallet, network: ENetwork) => {
    const connector = Wallet[wallet];
    return initializeConnector(
        (actions) =>
            new connector({ ...actions, actions } as any, options, true)
    );
};
