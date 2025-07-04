import { Button } from '@/components/Button';
import { useCreateProgram } from '@/features/scholarship/hooks/create-program';
import React from 'react';

function CreateProgram() {
  const [{ mutate, isPending }] = useCreateProgram();
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutate({
      title: formData.get('title') + '',
      description: formData.get('description') + '',
      end: new Date(formData.get('endDate') + '').getTime(),
      start: new Date(formData.get('startDate') + '').getTime(),
      target: +(formData.get('target') ?? 0),
    });
  };
  return (
    <form
      onSubmit={onSubmit}
      className="[&>*>*>button]:w-full flex flex-col gap-2 mt-6 [&>label]:flex [&>label]:flex-col [&>label]:font-nunito [&>label]:text-xl relative">
      {isPending && <div className="absolute inset-0 bg-black rounded-2xl"></div>}
      <label>
        Title
        <input type="text" name="title" />
      </label>
      <label>
        Description
        <textarea name="description" />
      </label>
      <label>
        Start Date
        <input type="date" name="startDate" />
      </label>
      <label>
        End Date
        <input type="date" name="endDate" />
      </label>
      <label>
        Target
        <input type="number" name="target" className="mb-5" />
      </label>

      <Button type={'submit' as never} label="Submit" />
    </form>
  );
}

export default CreateProgram;
