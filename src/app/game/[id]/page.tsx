import { SlotMachine } from "@/components/game/SlotMachine";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GamePage({ params }: Props) {
  const { id } = await params;
  return <SlotMachine />;
}
