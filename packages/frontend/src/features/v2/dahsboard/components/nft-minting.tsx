import { Button } from "@/components/Button";
import ProviderCard from "./nft-card/provider-card";
import StudentCard from "./nft-card/student-card";

const templates = {
  student: StudentCard,
  provider: ProviderCard,
};

export function NftMinting(props: {
  id: number;
  name: string;
  programName: string;
  onBack?: () => unknown;
  onMint?: (file: File) => unknown;
  disabled?: boolean;
  template: keyof typeof templates;
}) {
  function generateStarFills(stars: number, max = 5) {
    const fills: Record<string, string> = {};
    for (let i = 1; i <= max; i++) {
      fills[`star${i}`] = i <= stars ? "#FFD700" : "#d1d5db";
    }
    return fills;
  }

  const starFills = generateStarFills(3);
  const svg = templates[props.template]({
    id: `#${props.id.toString().padStart(3, "0")}`,
    name: props.name,
    programName: props.programName,
    ...starFills,
  });
  const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  function dataURLToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = decodeURIComponent(arr[1]);
    const u8arr = new TextEncoder().encode(bstr);
    return new File([u8arr], filename, { type: mime });
  }

  return (
    <div className="flex flex-col gap-3">
      <img className="z-50" src={svgUrl} width={384} height={535.32} />

      <div className="flex gap-2">
        <div className="grow pl-10">
          <Button
            onClick={() => {
              // if (props.disabled) return;
              // canvasRef.current!.toBlob((blob) => {
              //   if (!blob) return;
              //   const file = new File([blob], 'image.png', {
              //     type: 'image/png',
              //   });
              //   props.onMint?.(file);
              // });

              const file = dataURLToFile(svgUrl, "student-card.svg");

              props.onMint?.(file);
            }}
            label={"Mint"}
            className="!bg-skgreen !text-black w-full"
          />
        </div>
        <Button
          onClick={() => props.onBack?.()}
          label={<img src="/icons/arrow-left.svg" />}
          className="!bg-skyellow !text-black !p-2 aspect-square"
        />
      </div>
    </div>
  );
}
