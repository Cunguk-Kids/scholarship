/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabbing as TabbingPrimitive } from '@/components/Tabbing';
import { useGetPrograms } from '../hooks/get-programs';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/Button';
import { useCreateProgram } from '../hooks/create-program';
import { useClickOutside } from '@/hooks/useClickOutside';
import { appStateInjection } from '@/hooks/inject/app-state';
function CreateProgramForm() {
  const {
    loading: { setLoading },
  } = appStateInjection.use();
  const [{ mutate, isPending }] = useCreateProgram();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setLoading({ type: 'proccessing' });

    const formData = new FormData(event.currentTarget);
    mutate(
      {
        title: formData.get('title') + '',
        description: formData.get('description') + '',
        end: new Date(formData.get('endDate') + '').getTime(),
        start: new Date(formData.get('startDate') + '').getTime(),
        target: +(formData.get('target') ?? 0),
      },
      {
        onSuccess: () => {
          setLoading({ type: 'success' });
        },
        onError: (error) => {
          setLoading({ type: 'error', message: '' + error });
        },
      },
    );
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
export function Tabbing<T>({
  onClickTabbing,
}: {
  onClickTabbing?: (item: Record<string, T>, activeTab: string) => void;
}) {
  const tabsData = [
    {
      id: 'active',
      label: 'Active Scholarships',
      color: 'bg-skpurple',
    },
    {
      id: 'vote',
      label: 'On Voting',
      color: 'bg-skred',
    },
    {
      id: 'donate',
      label: 'Donate',
      color: 'bg-skgreen',
    },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { programs } = useGetPrograms();

  const handleTabbing = (item: Record<string, any>, activeTab: string) => {
    if (onClickTabbing) onClickTabbing(item, activeTab);
  };

  useClickOutside(ref, () => setOpen(!open));

  return (
    <>
      {open &&
        createPortal(
          <div
            ref={ref}
            className="bg-skbw neo-shadow rounded-2xl border-2 fixed z-10 inset-0 m-auto w-max h-max p-6">
            <h2 className="font-paytone text-7xl">CREATE PROGRAM</h2>
            <CreateProgramForm />
          </div>,
          document.documentElement,
        )}
      <div className="relative">
        <div className="absolute z-20 top-0 right-0 bg-black rounded-full size-max">
          <button
            onClick={() => {
              setOpen((x) => !x);
            }}
            className="border-4 p-2 aspect-square rounded-full bg-skpink -translate-x-0.5 -translate-y-0.5">
            ___
          </button>
        </div>
        <TabbingPrimitive
          programs={
            programs?.map((x) => {
              // @ts-expect-error ytta
              x.programMetadataCID = x.title;
              // @ts-expect-error ytta
              x.endDate = new Date(x.endDate ?? '').getTime();
              // @ts-expect-error ytta
              x.startDate = new Date(x.startDate ?? '').getTime();
              // @ts-expect-error ytta
              x.programContractAddress = x.contractAddress;
              return x;
            }) as never
          }
          tabs={tabsData}
          onClickTabbing={handleTabbing}
        />
      </div>
    </>
  );
}
