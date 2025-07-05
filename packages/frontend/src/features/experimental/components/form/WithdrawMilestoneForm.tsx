import { useWithdrawMilestone } from "../../hooks/@programs/applicant/use-withdraw-milestone";
import { Button } from "@/components/Button";
import { ExperimentalInjection } from "../../context/experimental-context";

export function WithdrawMilestoneForm() {
  const {
    data: { address },
  } = ExperimentalInjection.use();

  const [write] = useWithdrawMilestone(address ?? "0x0");
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    write({
      id: BigInt(+form.get("id")!),
      metadataProve: form.get("prove") + "",
    });
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="[&>*>*>button]:w-full flex flex-col gap-2 mt-6 [&>label]:flex [&>label]:flex-col [&>label]:font-nunito [&>label]:text-xl relative"
    >
      <label>
        Id
        <input type="text" name="id" placeholder="e.g. 0.05" required />
      </label>
      <label>
        Prove
        <input type="text" name="prove" placeholder="e.g. 0.05" required />
      </label>

      <Button type={"submit" as never} label="Donate" />
    </form>
  );
}
