import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "D-NOB - Dedicated Network of Belonging",
  description: "A protected community platform connecting pediatric patients with peers during treatment. Turning hospital isolation into real friendship.",
};

export default function Home() {
  return <HomeClient />;
}
