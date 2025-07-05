import SplitText from '@/components/ui/split-text';
import { Tabbing } from '@/features/scholarship/components/tabbing';
import { Flower } from '@/features/scholarship/components/flower';
import { Party } from '@/features/scholarship/components/party';
import { IllustProvider } from '@/features/scholarship/components/illust-provider';
import { IllustStudent } from '@/features/scholarship/components/illust-student';
import { Bottom } from '../components/bottom';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ApplyForm from '../components/form/ApplyForm';
import { useClickOutside } from '@/hooks/useClickOutside';
export function ScholarshipsPage() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleTabClick = <T,>(item: Record<string, T>) => {
    console.log(item);
    setOpen(!open);
    // write.mutate({
    //   milestones: selectedMilestone.map((item) => ({
    //     ...item,
    //     title: '',
    //     description: '',
    //   })),
    //   name: 'IDK',
    // });
  };

  // hooks
  useClickOutside(ref, () => setOpen(!open));
  return (
    <>
      {open &&
        createPortal(
          <div
            ref={ref}
            className="bg-skbw neo-shadow rounded-2xl border-2 fixed z-10 inset-0 m-auto w-max h-max p-6">
            <h2 className="font-paytone text-7xl">Apply Program</h2>
            <ApplyForm />
          </div>,
          document.documentElement,
        )}
      <div className="grid grow text-5xl relative h-[calc(100vh-162.4px)]">
        <Bottom />
        <Flower />
        <Party />
        <IllustProvider />
        <IllustStudent />

        <div className="font-paytone flex flex-col items-center gap-6 mt-30">
          <SplitText
            text="Empower the Future."
            delay={150}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <SplitText
            text="or Be Empowered."
            delay={150}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-99px"
            textAlign="center"
          />
          <div className="text-xl font-nunito w-110 text-center">
            <SplitText
              text="All scholarships are powered by smart contracts. Funds go directly to students, no middlemen."
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
        </div>
      </div>
      <div
        className="h-screen p-8 place-content-center"
        style={{
          backgroundImage: `linear-gradient(
        var(--color-skyellow) 50%,
        var(--color-skbw) 50%
        )`,
        }}>
        <div className="gap-6 flex flex-col mx-auto w-max">
          <div className="flex flex-col gap-6">
            <h2 className="font-paytone text-5xl">Find a Scholarship...</h2>
            <p className="text-2xl">Your Next Opportunity Starts Here</p>
          </div>
          <div className="w-max">
            <Tabbing onClickTabbing={handleTabClick} />
          </div>
        </div>
      </div>
    </>
  );
}
