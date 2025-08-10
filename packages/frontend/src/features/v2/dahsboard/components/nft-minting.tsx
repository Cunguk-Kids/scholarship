import { Button } from "@/components/Button";
import { useMemo, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

function convertToPNG(el: HTMLImageElement): Promise<File> {
  const resolution = 2.5;
  const canvas = document.createElement("canvas");
  canvas.width = 384 * resolution;
  canvas.height = 535.32 * resolution;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(el, 0, 0, 384 * resolution, 535.32 * resolution);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "nft-card.png", { type: blob.type });
      console.log(file);
      resolve(file);
    }, "image/png");
  });
}

function generateStarFills(stars: number, max = 5) {
  const fills: Record<string, string> = {};
  for (let i = 1; i <= max; i++) {
    fills[`star${i}`] = i <= stars ? "#FFD700" : "#d1d5db";
  }
  return fills;
}
const starFills = generateStarFills(3);
// function dataURLToFile(dataUrl: string, filename: string): File {
//   const arr = dataUrl.split(",");
//   const mime = arr[0].match(/:(.*?);/)![1];
//   const bstr = decodeURIComponent(arr[1]);
//   const u8arr = new TextEncoder().encode(bstr);
//   return new File([u8arr], filename, { type: mime });
// }
export function NftMinting(props: {
  id: number;
  name: string;
  programName: string;
  onBack?: () => unknown;
  onMint?: (file: File) => unknown;
  disabled?: boolean;
  template: "student" | "provider";
}) {
  const {data: generateTemplate} = useSuspenseQuery({
    queryKey: ["nft-template", props.template],
    async queryFn() {
      switch(props.template) {
        case "student": return import("./nft-card/student-card").then(x => x.default)
        case "provider": return import("./nft-card/provider-card").then(x => x.default)
      }
    }
  });
  const ref = useRef<HTMLImageElement>(null);
  const svg = useMemo(
    () =>
      generateTemplate?.({
        id: `#${props.id.toString().padStart(3, "0")}`,
        name: props.name,
        programName: props.programName,
        ...starFills,
      }) ?? "",
    [props.name, props.id, props.programName, generateTemplate]
  );

  const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <div className="flex flex-col gap-3">
      <img
        className="z-50"
        src={svgUrl}
        ref={ref}
        width={384}
        height={535.32}
      />

      <div className="flex gap-2">
        <div className="grow pl-10">
          <Button
            onClick={async () => {
              if (!ref.current) return;
              const file = await convertToPNG(ref.current);
              props.onMint?.(file);
              // const file = dataURLToFile(svgUrl, "student-card.svg");

              // props.onMint?.(file);
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
