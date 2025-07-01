import { useReadContract } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";
import { createInjection } from "../../util/create-inject";

export const appStateInjection = createInjection(() => {
  const appStatus = useReadContract({
    abi: scholarshipAbi,
    address: skoolchainAddress,
    functionName: "appStatus",
  });

  const appBatch = useReadContract({
    abi: scholarshipAbi,
    address: skoolchainAddress,
    functionName: "appBatch",
  });

  return { appStatus, appBatch };
});
