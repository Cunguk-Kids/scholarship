import { formatCurrency } from "@/util/currency";
import { BaseCard } from "./base-card";
import { Button } from "@/components/Button";
import { Loader } from "@/components/fallback/loader";
import { useState } from "react";
import { NftMinting } from "./nft-minting";
import { useMintApplicantNFTV2 } from "../hooks/mint-applicant-nft";
import { useWithdrawMilestoneV2 } from "../hooks/withdraw-milestone";

export function StudentDashboardCard(props: {
  name: string;
  motivationHeadline: string;
  profileImage: string;
  programTitle: string;
  programCreator: string;
  programId: number;
  studentId: number;
  totalFund: number;
  milestoneProgress?: React.ReactNode;
  programCreatorImage: string;
  isLoading: boolean;
  milestoneType: string;
  clickNext?: () => unknown;
}) {
  const { mutate: withdraw } = useWithdrawMilestoneV2();
  const { mutate, isPending } = useMintApplicantNFTV2();
  const [isOnMintNFT, setIsOnMintNFT] = useState(false);
  return isOnMintNFT ? (
    <NftMinting
      disabled={isPending}
      template="student"
      name={props.name}
      id={props.studentId}
      programName={props.programTitle}
      onMint={(file) => {
        mutate({
          studentId: props.studentId + "",
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
            <div className="bg-skpink border w-max px-2 text-black rounded-full">
              Student
            </div>
            <h1 className="font-paytone text-2xl capitalize">
              Hi, {props.name}!
            </h1>
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
        <h2>{props.motivationHeadline}</h2>
      </div>
      <div
        className="transition-opacity"
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
      >
        <img
          src={props.profileImage}
          className="size-38 rounded-3xl mx-auto"
          alt={props.name}
        />
      </div>
      <div
        className="space-y-3 transition-opacity"
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
      >
        <p>Active Scholarship:</p>
        <h2 className="text-2xl font-bold">{props.programTitle}</h2>
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
        <p>Total Fund Recieved:</p>
        <div className="flex items-center gap-2">
          <img
            className="size-4"
            src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694"
            alt="usd"
          />
          <p>{formatCurrency(props.totalFund / 10 ** 6, "USD")}</p>
        </div>
        {props.milestoneProgress}
        <div className="flex justify-between gap-2 mt-5">
          {props.milestoneType === "FIXED" && (
            <Button
              className="w-full !bg-skgreen !text-black"
              wrapperClassName="grow"
              onClick={() => {
                withdraw({ programId: props.programId });
              }}
              label="Withdraw"
            />
          )}
          <Button
            onClick={() => setIsOnMintNFT(true)}
            label="Mint Student NFT"
            wrapperClassName="grow"
            className=" w-full text-center"
          />
        </div>
      </div>
    </BaseCard>
  );
}
