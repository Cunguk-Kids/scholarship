import { useEffect, useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

export function UploadDropzone(props: {
  name: string;
  onDrop?: (acceptedFiles: FileList | null) => void;
  upContent?: ReactNode;
  containerClassName?: string;
  innerContainerClassName?: string;
  title?: string;
  subtitle?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setIsOnDrag] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const rect = useRef<DOMRect>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleOnDrop: typeof props.onDrop = (files) => {
    if (files && files.length > 1) {
      return toast.error("You can't upload more than one file");
    }
    if (files) {
      for (const file of files) {
        if (!file.type.includes("image/")) {
          return toast.error("You can only upload images");
        }
      }
    }
    props.onDrop?.(files);
    setFiles(files);
    inputRef.current!.files = files;
  };

  useEffect(() => {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
  }, []);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsOnDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsOnDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOnDrag(false);
        handleOnDrop(e.dataTransfer.files);
      }}
      className={`flex flex-col grow gap-4 ${props.containerClassName || ""}`}
    >
      <input
        required
        name={props.name}
        ref={inputRef}
        onChange={(event) => {
          handleOnDrop(event.target.files);
        }}
        type="file"
        accept="image/*"
        hidden
      />
      {props.upContent}
      {files && files.length > 0 ? (
        <img
          src={URL.createObjectURL(files[0])}
          alt={files[0].name}
          className="object-contain rounded-xl shadow-box"
          style={{
            width: rect.current?.width,
            height: rect.current?.height,
          }}
        />
      ) : (
        <div
          ref={ref}
          className={`flex flex-col items-center grow justify-center ${props.innerContainerClassName ?? ""}`}
        >
          <img alt="upload-cloud" src="/icons/upload-cloud.svg" />
          <div className="text-lg font-semibold">{props.title ?? "Choose file"}</div>
          <div className="text-gray-500 text-xs max-w-90 text-center">
            {props.subtitle ?? "Add image, or links"}
          </div>
        </div>
      )}
    </label>
  );
}
