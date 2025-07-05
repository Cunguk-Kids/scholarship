import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

export const CardDashboard = ({}) => {
  return (
    <div className="bg-black rounded-2xl">
      <div className="relative -top-2 -left-2 flex w-96 flex-col items-start gap-3">
        <div className="flex p-4 flex-col items-start gap-2 self-stretch rounded-2xl border bg-white">
          <div className="flex flex-col justify-center items-center gap-2 self-stretch">
            <div className="flex flex-col items-start gap-2 self-stretch">
              <StatusBadge status="Student" />
              <h1 className="font-paytone text-4xl">Hi, User!</h1>
              <p className="">Let's get you one step closer to your dreams.</p>
            </div>
            <img
              src="/icons/applicant1.png"
              alt="profile-picture"
              className="rounded-2xl aspect-square"
            />
          </div>

          <div className="flex-col items-start gap-1 self-stretch">
            <p className="text-sm font-medium">Active Scholarship:</p>
            <h3 className="text-xl font-bold">KampusKita Grant 2025</h3>
            <div className="flex items-center gap-2 self-stretch">
              <img src="/icons/provider-icon.svg" alt="provider-icon" />
              <p className="text-center text-sm">KampusKita Foundation</p>
            </div>
          </div>

          <div className="border-t h-1 self-stretch"></div>

          <div className="flex flex-col items-start gap-1 self-stretch">
            <p className="text-sm">Total Fund Received:</p>
            <h3 className="font-bold">45000 MON ≃ Rp5.000.000</h3>
          </div>

          <div className="flex flex-col items-start gap-1 self-stretch">
            <h5 className="text-sm">Disbursement:</h5>
            <div className="flex flex-col items-start gap-2 self-stretch">
              <div className="flex items-center gap-4 self-stretch">
                <img src="" alt="" />
                <h3 className="text-sm w-1/2">Tuition Payment</h3>
                <StatusBadge status="Disbursed" />
              </div>
              <div className="flex items-center gap-4 self-stretch">
                <img src="" alt="" />
                <h3 className="text-sm w-1/2">Coursework Essentials</h3>
                <StatusBadge status="Pending" />
              </div>
              <div className="flex items-center gap-4 self-stretch">
                <img src="" alt="" />
                <h3 className="text-sm w-1/2">Thesis Project</h3>
                {/* <StatusBadge status="Disbursed" /> */}
              </div>
            </div>
          </div>
        </div>
        <div className="flex p-4 flex-col justify-end items-end gap-3 self-stretch rounded-2xl border bg-white">
          <div className="flex flex-col justify-center items-center gap-2 self-stretch">
            <div className="flex justify-center items-center gap-2.5">
              <img
                src="/icons/message-notification-01.svg"
                alt="msg-notif-icon"
              />
              <span className="text-sm">
                from <span className="font-bold">KampusKita Foundation</span>
              </span>
            </div>
            <div className="border-t h-1 self-stretch"></div>
            <p>
              "Keep creating and keep believing, Utami. You’ve got talent—this
              is just the beginning. 💫"
            </p>
          </div>
          <Button label="Reply" />
        </div>
      </div>
    </div>
  );
};
