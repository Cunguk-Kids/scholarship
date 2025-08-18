import { api } from "@/util/api";
import { useMutation } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import toast from "react-hot-toast";
import type { Address } from "viem";
import { useConfig } from "wagmi";

export function useGetFaucet() {
  const config = useConfig();
  return useMutation({
    onMutate: () => {
      toast.loading("Getting Faucet..", { id: "get-faucet" });
    },

    onSuccess: () => {
      toast.success("Faucet Transfered", { id: "get-faucet" });
    },

    onError: () => {
      toast.error("Faucet error", { id: "get-faucet" });
    },
    mutationFn: async (address: Address) => {
      const response = await api.post<{
        data: { address: Address; txHash: Address };
      }>(
        "/faucet",
        {
          address,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      await waitForTransactionReceipt(config, { hash: response.data.data.txHash });

      return response;
    },
  });
}
