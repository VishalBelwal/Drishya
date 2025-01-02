"use client";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React from "react";

//custom functional component
const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-start gap-2 ">
    <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
      {title}
    </h1>
    <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
      {description}
    </h1>
  </div>
);

export default function PersonalRoom() {
  const { user, isLoaded } = useUser();
  const meetingId = user?.id!;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;
  const { call } = useGetCallById(meetingId);
  const client = useStreamVideoClient();
  const router = useRouter();

  const startNewMeetingRoom = async () => {
    if (!client || !user) return;

    //if we have a client
    if (!call) {
      const newCall = client?.call("default", meetingId);

      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });
    }
    router.push(`/meeting/${meetingId}?personal=true`);
  };

  if (!isLoaded)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="flex size-fll flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Personal Room</h1>
      <div className="w-full flex flex-col gap-8 xl:max-w-[900px]">
        <Table title="Topic" description={`${user?.username}'s meeting room`} />
        <Table title="Meeting Id" description={`${meetingId}`} />
        <Table title="Invite Friends" description={`${meetingLink}`} />
      </div>

      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startNewMeetingRoom}>
          Start Meeting
        </Button>
        <Button
          className="bg-dark-3"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link Successfully Copied",
            });
          }}
        >
          Copy Invitation Link
        </Button>
      </div>
    </div>
  );
}