import type { Metadata } from "next";
import ReferenceHome from "@/components/homepage/ReferenceHome";

export const metadata: Metadata = {
  title: "Social and Solidarity Economy Knowledge Platform",
  description: "Research, articles, data and solidarity experiences from the social and solidarity economy.",
};

export default function EnHomePage() {
  return <ReferenceHome />;
}
