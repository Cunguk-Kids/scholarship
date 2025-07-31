import { useEffect, useRef } from "react";

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
  const image = await loadImage("/img/nft-student.png");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "20px 'Paytone One', sans-serif ";
  ctx.fillText(props.name, 80,  0);
  ctx.fillText(props.name, 80, canvas.height - 85);
  ctx.fillText(`#00${props.id}`, canvas.width - 90, canvas.height - 130);
};

export function NftMinting(props: {
  id: number;
  name: string;
  programName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    draw(props, canvasRef.current!, canvasRef.current!.getContext("2d")!);
  }, [props]);
  return (
    <canvas ref={canvasRef} width={384} height={535.32} className="relative" />
  );
}

<img
  src="/img/nft-student.png"
  alt="nft-student"
  className="block z-1 relative"
/>;
