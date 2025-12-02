import { SlotMachine } from "@/components/game/SlotMachine";
import { CrashGame } from "@/components/game/CrashGame";
import { FishingGame } from "@/components/game/FishingGame";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function GamePage({ params, searchParams }: Props) {
  await params;
  const { type } = await searchParams;

  if (type === "crash") {
    return <CrashGame />;
  }
  
  if (type === "fishing") {
    return <FishingGame />;
  }

  // Default to Slots
  return <SlotMachine />;
}
