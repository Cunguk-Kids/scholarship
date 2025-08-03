import { Button } from "@/components/Button";
import { Loader } from "@/components/fallback/loader";
import { formatCurrency, formatUSDC } from "@/util/currency";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const types = {
  disbursed: "bg-skgreen border-2 border-green-500",
  pending: "bg-skyellow border-2 border-yellow-500",
  locked: "bg-[#D9D9D9] border-2 border-[#CCC]",
} as const;

type Milestone = {
  type: keyof typeof types;
  amount: number | null;
  blockchainId: number | null;
  estimation: number | null;
  description: string | null;
  proveCID: string | null;
  isCollected: boolean;
  isApproved: boolean;
};

export function Milestones(props: {
  programType: string;
  isPending?: boolean;
  isLoading: boolean;
  programId: number;
  milestones: Milestone[];
  onSubmit?: (
    milestone: Milestone,
    value: { proveImage: File; description: string }
  ) => unknown;
}) {
  useEffect(() => {
    gsap.fromTo(".milestone", { scaleY: 0 }, { scaleY: 1, stagger: 0.5 });
  }, [props.programId]);
  return (
    <div className="h-full w-full relative isolate">
      {props.isLoading && (
        <Loader className="inset-0 absolute m-auto size-20" />
      )}
      <div
        style={{
          opacity: props.isLoading ? 0 : 1,
        }}
        className="flex flex-col h-full w-full"
      >
        {props.milestones.map((mile, index) => {
          return (
            <div
              key={index}
              className={`origin-top milestone ${mile.type == "pending" ? "grow grid-rows-[min-content_1fr]" : ""} grid grid-cols-[16px_repeat(11,1fr)] gap-2 w-full relative isolate before:absolute before:w-1 before:top-0 ${props.milestones.length - 1 == index ? "" : "before:bottom-0"} py-2 before:left-1 before:-z-1 ${mile.type === "disbursed" ? "before:bg-green-500" : "before:bg-[#CCC]"} before:translate-y-4`}
            >
              <div
                className={`milestone-point ${types[mile.type]} rounded-full size-3 relative before:absolute before:inset-0 self-start mt-[5px]`}
              ></div>
              <div className="col-span-1 w-max">Milestone #{index + 1}</div>
              <div className="col-span-4 font-bold max-md:col-[2/13]">
                {mile.description}
              </div>
              <div className="col-span-3 font-bold max-md:col-[2/13]">
                {formatCurrency(formatUSDC(mile.amount ?? 0), "USD")}
              </div>
              {mile.type == "locked" ? (
                <div className="col-[-4/-1] text-xs self-end ml-auto max-md:col-[2/13] max-md:ml-0">
                  🔒 Locked until Milestone {index} approved
                </div>
              ) : (
                <div
                  className={`capitalize ${types[mile.type]} col-[-3/-1] max-md:row-[1/2] w-max ml-auto rounded-full text-xs font-bold px-2 !border-black !border self-start`}
                >
                  {mile.isApproved
                    ? props.programType === "FIXED"
                      ? "approved"
                      : "disbursed"
                    : mile.type}
                </div>
              )}
              {mile.type === "pending" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (props.isPending) return;
                    const entry = Object.fromEntries(
                      new FormData(e.currentTarget)
                    );
                    props.onSubmit?.(mile, entry as never);
                  }}
                  className="col-[2/13] flex flex-col gap-3"
                >
                  <div className=" bg-white rounded-2xl border p-4 flex flex-col gap-2 grow">
                    <label className="space-y-3">
                      <div className="flex items-center gap-2">
                        <img
                          alt="msg-notif-icon"
                          src="/icons/message-notification-01.svg"
                        />
                        Tell us how you used the funds and how it helped you!
                      </div>
                      <textarea
                        required
                        name="description"
                        rows={1}
                        className="!shadow-none !border-none outline-none w-full"
                        placeholder="Example: I used the funds to pay my tuition."
                      />
                    </label>
                    <div className="h-px bg-black/10"></div>
                    <UploadDropzone name="proveImage" />
                  </div>
                  <div className="self-end">
                    <Button type="submit" label="Submit" />
                  </div>
                </form>
              )}
            </div>
          );
        })}
        {!props.milestones.length && (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <img
              src="/img/Illustration Student.svg"
              alt="empty-state"
              className=""
            />
            <div className="font-bold text-2xl">No milestones found</div>
          </div>
        )}
      </div>
    </div>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useDebounce<T>(
  value: T,
  opts: {
    delay: number;
  } = { delay: 1_000 }
) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceValue(value), opts.delay);

    return () => clearTimeout(timeout);
  }, [opts.delay, value]);

  return debounceValue;
}

function UploadDropzone(props: {
  name: string;
  onDrop?: (acceptedFiles: FileList | null) => void;
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
      className="flex flex-col grow gap-4"
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
      <div className="flex items-center gap-2">
        <img alt="upload-square" src="/icons/upload-square.svg" />
        Upload invoice, receipts, or a short explanation of how the fund was
        used.
      </div>
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
          className="flex flex-col items-center grow justify-center"
        >
          <img alt="upload-cloud" src="/icons/upload-cloud.svg" />
          <div className="text-lg font-semibold">Upload Proof</div>
          <div className="text-gray-500 text-xs max-w-90 text-center">
            Any receipts, screenshots, or assignments that show your milestone
            is done.
          </div>
        </div>
      )}
    </label>
  );
}
