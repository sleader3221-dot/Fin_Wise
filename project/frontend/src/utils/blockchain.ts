import { BrowserProvider, JsonRpcSigner, Contract, formatEther, parseEther } from 'ethers';
import type { Eip1193Provider } from 'ethers';

interface WalletInfo {
  address: string;
  balance: string;
  network: {
    name: string;
    chainId: number;
  };
}

interface ContractCallOptions {
  contractAddress: string;
  abi: any[];
  method: string;
  args?: any[];
  value?: string;
}

interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  137: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  80001: {
    chainId: 80001,
    chainName: 'Mumbai Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
  11155111: {
    chainId: 11155111,
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

class BlockchainService {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private walletInfo: WalletInfo | null = null;

  private getProvider(): BrowserProvider {
    if (!this.provider) {
      const ethereum = (window as any).ethereum as Eip1193Provider;
      if (!ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
      }
      this.provider = new BrowserProvider(ethereum);
    }
    return this.provider;
  }

  async connectWallet(): Promise<WalletInfo> {
    try {
      const provider = this.getProvider();
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      this.signer = signer;
      this.walletInfo = {
        address,
        balance: formatEther(balance),
        network: {
          name: network.name,
          chainId: Number(network.chainId),
        },
      };

      return this.walletInfo;
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error('Wallet connection rejected by user.');
      }
      throw new Error(err.message || 'Failed to connect wallet.');
    }
  }

  async disconnect(): Promise<void> {
    this.signer = null;
    this.walletInfo = null;
  }

  async getWalletInfo(): Promise<WalletInfo> {
    if (this.walletInfo) return this.walletInfo;

    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      this.signer = signer;
      this.walletInfo = {
        address,
        balance: formatEther(balance),
        network: {
          name: network.name,
          chainId: Number(network.chainId),
        },
      };

      return this.walletInfo;
    } catch {
      throw new Error('Wallet not connected.');
    }
  }

  async getBalance(address?: string): Promise<string> {
    try {
      const provider = this.getProvider();
      const targetAddress = address || (await this.getWalletInfo()).address;
      const balance = await provider.getBalance(targetAddress);
      return formatEther(balance);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch balance.');
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('No Web3 wallet detected.');
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (err: any) {
      if (err.code === 4902 || err.data?.originalError?.code === 4902) {
        const network = SUPPORTED_NETWORKS[chainId];
        if (!network) {
          throw new Error(`Network with chainId ${chainId} is not supported.`);
        }
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addErr: any) {
          throw new Error(addErr.message || 'Failed to add network.');
        }
      } else {
        throw new Error(err.message || 'Failed to switch network.');
      }
    }

    this.provider = null;
    this.signer = null;
    this.walletInfo = null;
  }

  async signMessage(message: string): Promise<string> {
    try {
      const signer = this.signer || (await this.getProvider().getSigner());
      return await signer.signMessage(message);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign message.');
    }
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    try {
      const signer = this.signer || (await this.getProvider().getSigner());
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(value),
      });
      return tx.hash;
    } catch (err: any) {
      throw new Error(err.message || 'Transaction failed.');
    }
  }

  async callContractRead<T = any>(options: ContractCallOptions): Promise<T> {
    try {
      const provider = this.getProvider();
      const contract = new Contract(options.contractAddress, options.abi, provider);
      const result = await contract[options.method](...(options.args || []));
      return result as T;
    } catch (err: any) {
      throw new Error(err.message || 'Contract call failed.');
    }
  }

  async callContractWrite<T = any>(options: ContractCallOptions): Promise<T> {
    try {
      const signer = this.signer || (await this.getProvider().getSigner());
      const contract = new Contract(options.contractAddress, options.abi, signer);

      const overrides: Record<string, any> = {};
      if (options.value) {
        overrides.value = parseEther(options.value);
      }

      const tx = await contract[options.method](...(options.args || []), overrides);
      const receipt = await tx.wait();
      return receipt as T;
    } catch (err: any) {
      throw new Error(err.message || 'Contract write failed.');
    }
  }

  async listenToAccountChanges(callback: (accounts: string[]) => void): Promise<void> {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts: string[]) => {
        this.provider = null;
        this.signer = null;
        this.walletInfo = null;
        callback(accounts);
      });
    }
  }

  async listenToNetworkChanges(callback: (chainId: string) => void): Promise<void> {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.on('chainChanged', (chainId: string) => {
        this.provider = null;
        this.signer = null;
        this.walletInfo = null;
        callback(chainId);
      });
    }
  }

  removeAllListeners(): void {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.removeAllListeners('accountsChanged');
      ethereum.removeAllListeners('chainChanged');
    }
  }

  isWalletInstalled(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  }

  getSupportedNetworks(): NetworkConfig[] {
    return Object.values(SUPPORTED_NETWORKS);
  }

  isConnected(): boolean {
    return this.signer !== null && this.walletInfo !== null;
  }

  getAddress(): string | null {
    return this.walletInfo?.address || null;
  }

  async isCorrectNetwork(targetChainId: number): Promise<boolean> {
    try {
      const info = await this.getWalletInfo();
      return info.network.chainId === targetChainId;
    } catch {
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();

export type { WalletInfo, ContractCallOptions, NetworkConfig };
export { BlockchainService };
