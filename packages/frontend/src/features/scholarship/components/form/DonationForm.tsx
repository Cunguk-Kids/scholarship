import { Button } from '@/components/Button';
import { useMakeDonation } from '@/hooks/@programs/donor/use-make-donation';

function DonationForm({ address }: { address: string }) {
  const [write] = useMakeDonation(address);
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    write(form.get('price') as string);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="[&>*>*>button]:w-full flex flex-col gap-2 mt-6 [&>label]:flex [&>label]:flex-col [&>label]:font-nunito [&>label]:text-xl relative">
      <label>
        Price (MON)
        <input type="text" name="price" placeholder="e.g. 0.05" required />
      </label>

      <div className="w-full flex justify-center mt-2"></div>
      <Button type={'submit' as never} label="Donate" />
    </form>
  );
}

export default DonationForm;
