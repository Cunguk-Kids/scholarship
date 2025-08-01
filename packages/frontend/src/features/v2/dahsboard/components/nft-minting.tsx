import { Button } from "@/components/Button";
import { useEffect, useRef } from "react";

const templates = {
  student: "/img/nft-student.png",
  provider: "img/nft-provider.png",
};

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });
};

const draw = async (
  props: Parameters<typeof NftMinting>[0],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  const image = await loadImage(templates[props.template]);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "22px 'Paytone One', sans-serif ";
  ctx.fillText(props.name, 40, canvas.height - 60);
  ctx.font = "20px 'Paytone One', sans-serif ";
  ctx.fillText(
    `#${props.id.toString().padStart(3, "0")}`,
    canvas.width - 90,
    canvas.height - 130
  );
  ctx.font = "10px 'Paytone One', sans-serif ";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillText(props.programName, 35, canvas.height - 85 - 50);
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    draw(props, canvasRef.current!, canvasRef.current!.getContext("2d")!);
  }, [props]);
  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={384}
        height={535.32}
        className="relative"
      />
      <div className="flex gap-2">
        <div className="grow pl-10">
          <Button
            onClick={() => {
              if (props.disabled) return;
              canvasRef.current!.toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], "image.png", {
                  type: "image/png",
                });
                props.onMint?.(file);
              });
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
