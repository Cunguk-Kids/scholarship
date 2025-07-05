type Input = {
  type: string;
  value?: string;
  onChange?: (val: string) => void;
  onUpload?: (file: File) => void;
};

export const Input = ({ type, value, onChange, onUpload }: Input) => {
  const inputId = "upload-file";
  return (
    <div className="flex w-full items-center">
      {type === "upload" && (
        <label
          htmlFor={inputId}
          className="flex flex-col justify-center items-center gap-4 shrink-0 text-center w-full"
        >
          <img src="/icons/upload-cloud.svg" alt="upload-cloud-icon" />
          <h2 className="font-bold text-center font-">Upload proof</h2>
          <p className="text-xs">
            Any receipts, screenshots, or assignments that show your milestone
            is done.
          </p>
          <input
            id={inputId}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUpload?.(e.target.files[0]);
              }
            }}
          />
        </label>
      )}
      {type === "text" && (
        <div className="w-full flex flex-col justify-center items-center gap-2 self-stretch">
          <div className="flex items-center gap-2.5 self-stretch">
            <img
              src="/icons/message-notification-01.svg"
              alt="notification-icon"
            />
            <label className="text-sm">
              Tell us how you used the funds and how it helped you!
            </label>
          </div>
          <div className="w-full self-stretch">
            <textarea
              className="w-full text-sm border-none bg-transparent focus:ring-0 text-black placeholder-gray-400"
              placeholder="Example: I used the funds to pay my tuition."
              rows={2}
              value={value}
              onChange={(e) => onChange && onChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
