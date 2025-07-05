/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootInjection } from '@/context/app-context';
import { useApplyProgram } from '@/hooks/@programs/applicant/use-apply-program';
import { useGetProgramContract } from '../../hooks/get-programs';
import { CardForm } from '@/components/CardForm';

function ApplyForm() {
  const {
    ref: { id },
    data: { address },
  } = RootInjection.use();

  const app = useGetProgramContract(address || '0x0');

  const [write] = useApplyProgram({
    address: address || '0x',
    appBatch: app.appBatch?.result ?? 0n,
    applicantSize: app.applicantSize?.result ?? 0n,
    nextMilestoneId: app.nextMilestone?.result ?? 0n,
    programId: BigInt(+id.current),
  });
  const onSubmit = (formData?: any) => {
    console.log('submit', formData);

    write.mutate({
      milestones: formData?.milestones?.map((item: any) => {
        return {
          mType: 'CUSTOM',
          price: item?.amount,
          templateId: 0,
          metadata: '',
          title: item?.title || '',
          description: item?.description || '',
        };
      }),
      name: 'IDK',
    });
  };

  return (
    <CardForm onSubmit={onSubmit} totalStep={2} type="applicant" />
    // <form
    //   onSubmit={onSubmit}
    //   className="[&>*>*>button]:w-full flex flex-col gap-2 mt-6 [&>label]:flex [&>label]:flex-col [&>label]:font-nunito [&>label]:text-xl relative">
    //   {isPending && <div className="absolute inset-0 bg-black rounded-2xl"></div>}
    //   <h1>Select Milestone</h1>
    //   <div className="flex flex-row gap-2">
    //     {milestones?.map(({ price }, index) => {
    //       const haveValue = selectedMilestone.find((item) => item.templateId === BigInt(index));

    //       if (haveValue) return <></>;
    //       return (
    //         <div key={index} className="w-fit">
    //           <Button
    //             label={String(price)}
    //             onClick={() => {
    //               handleSelectMilestone({
    //                 metadata: '',
    //                 mType: Number(0),
    //                 price: BigInt(0),
    //                 templateId: BigInt(index),
    //               });
    //             }}
    //           />
    //         </div>
    //       );
    //     }) || <div className="text-gray-400 text-sm italic">No form available.</div>}
    //   </div>
    //   <h1>Selected Milestone</h1>
    //   <div className="flex flex-row gap-2 mb-4">
    //     {milestones?.map(({ price }, index) => {
    //       const haveValue = selectedMilestone.find((item) => item.templateId === BigInt(index));

    //       if (!haveValue) return <></>;
    //       return (
    //         <div key={index} className="w-fit">
    //           <Button
    //             label={String(price)}
    //             onClick={() => {
    //               handleSelectMilestone({
    //                 metadata: '',
    //                 mType: Number(0),
    //                 price: BigInt(0),
    //                 templateId: BigInt(index),
    //               });
    //             }}
    //           />
    //         </div>
    //       );
    //     }) || <div className="text-gray-400 text-sm italic">No form available.</div>}
    //   </div>

    //   <Button type={'submit' as never} label="Submit" />
    // </form>
  );
}

export default ApplyForm;
