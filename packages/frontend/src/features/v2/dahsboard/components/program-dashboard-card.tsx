import { formatCurrency } from "@/util/currency";
import { BaseCard } from "./base-card";
import { Button } from "@/components/Button";
import { Loader } from "@/components/fallback/loader";
import { useMintProgramCreatorNFTV2 } from "../hooks/mint-program-creator-nft";
import { useState } from "react";
import { NftMinting } from "./nft-minting";
import { useAccount } from "wagmi";

export function ProgramDashboardCard(props: {
  programTitle: string;
  programDescription: string;
  programCreator: string;
  totalFund: number;
  programCreatorImage: string;
  isLoading: boolean;
  programId: number;
  clickNext?: () => unknown;
}) {
  const account = useAccount();
  const { mutate, isPending } = useMintProgramCreatorNFTV2();
  const [isOnMintNFT, setIsOnMintNFT] = useState(false);
  return isOnMintNFT ? (
    <NftMinting
      disabled={isPending}
      template="provider"
      name={`${account.address!.slice(0, 6)}...${account.address!.slice(-4, account.address!.length)}`}
      id={props.programId}
      programName={props.programTitle}
      onMint={(file) => {
        mutate({
          file,
          programId: props.programId + "",
        });
      }}
      onBack={() => setIsOnMintNFT(false)}
    />
  ) : (
    <BaseCard className="space-y-3 relative isolate">
      {props.isLoading && (
        <Loader className="absolute inset-0 m-auto size-20" />
      )}
      <div
        className="space-y-2 transition-opacity"
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="bg-skgreen font-bold text-xs w-max px-2 border text-black rounded-full">
              Scholarship Program
            </div>
            <h1 className="font-paytone text-2xl flex gap-3">
              <img
                className="size-5 rounded-full font-semibold mt-2"
                src={props.programCreatorImage}
                alt={props.programCreator}
              />
              {props.programTitle}
            </h1>
            <p>
              Here’s where your impact unfolds—in milestones, stories, and
              students you’ve empowered.
            </p>
          </div>
          <Button
            onClick={props.clickNext}
            className="size-10 bg-skyellow rounded-2xl place-content-center !p-0 group"
            label={
              <img
                src="/icons/arrow-right.svg"
                alt="arrow-right"
                className="group-active:rotate-90 transition-transform"
              />
            }
          />
        </div>
      </div>
      <div
        className="space-y-3 transition-opacity"
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
      >
        <h2 className="text-2xl font-bold">{props.programDescription}</h2>
        <div className="flex items-center gap-2">
          <img
            className="size-5 rounded-full font-semibold"
            src={props.programCreatorImage}
            alt={props.programCreator}
          />
          <h3 className="block">
            {props.programCreator.slice(0, 7)}...
            {props.programCreator.slice(-4)}
          </h3>
        </div>
        <div className="h-px bg-black/10"></div>
        <div className="">
          <p>Total Fund:</p>
          <div className="flex items-center gap-2">
            <img
              className="size-4"
              src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694"
              alt="usd"
            />
            <p className="font-bold">
              {formatCurrency(props.totalFund / 10 ** 6, "USD")}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
        className="flex justify-end"
      >
        <Button
          onClick={() => setIsOnMintNFT(true)}
          label="Mint Program Creator NFT"
          className="!bg-skgreen !text-black"
        />
      </div>
    </BaseCard>
  );
}
