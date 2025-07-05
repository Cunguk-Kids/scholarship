import { Button } from "@/components/Button";
import React from "react";
import { useAddMilestoneTemplate } from "../../hooks/@programs/admin/use-add-milestone-template";

function CreateMilestoneTemplate() {
  const [{ mutate }] = useAddMilestoneTemplate();
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    mutate({
      price: form.get("price") + "",
      title: form.get("title") + "",
      description: form.get("description") + "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="[&>*>*>button]:w-full flex flex-col gap-2 mt-6 [&>label]:flex [&>label]:flex-col [&>label]:font-nunito [&>label]:text-xl relative"
    >
      <label>
        Price (ETH)
        <input type="text" name="price" placeholder="e.g. 0.05" required />
      </label>

      <label>
        Title
        <input type="text" name="title" required />
      </label>

      <label>
        Description
        <textarea name="description" />
      </label>

      <div className="w-full flex justify-center mt-2"></div>
      <Button type={"submit" as never} label="Add Milestone" />
    </form>
  );
}

export default CreateMilestoneTemplate;
