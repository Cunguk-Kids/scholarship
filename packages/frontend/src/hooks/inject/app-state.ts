import { useReadContracts } from "wagmi";
import { scholarshipAbi } from "../../repo/abi";
import { skoolchainAddress } from "../../constants/contractAddress";
import { createInjection } from "../../util/create-inject";
import { useEffect, useMemo } from "react";

const appStatusEnum = [
  "PENDING",
  "OPEN_FOR_APPLICATIONS",
  "VOTING_OPEN",
  "COMPLETED",
] as const;

export const appStateInjection = createInjection((blockNumber: bigint) => {
  const { data: [appStatus, appBatch, applicantSize] = [], ...queryState } =
    useReadContracts({
      contracts: [
        {
          abi: scholarshipAbi,
          address: skoolchainAddress,
          functionName: "appStatus",
          args: [],
        },
        {
          abi: scholarshipAbi,
          address: skoolchainAddress,
          functionName: "appBatch",
          args: [],
        },
        {
          abi: scholarshipAbi,
          address: skoolchainAddress,
          functionName: "getApplicantSize",
          args: [],
        },
      ],
      query: {
        enabled: blockNumber > 1n,
      },
    });

  const readableAppStatus = useMemo(
    () => appStatusEnum[appStatus?.result ?? 0],
    [appStatus?.result]
  );

  useEffect(() => {
    queryState.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  const injected = {
    appStatus,
    appBatch,
    readableAppStatus,
    applicantSize,
    queryState,
  };

  return injected;
});
