import type { Metadata } from "next";
import ReferenceHome from "@/components/homepage/ReferenceHome";

export const metadata: Metadata = {
  title: "پلتفرم دانشی اقتصاد اجتماعی و همبستگی",
  description: "پژوهش‌ها، داده‌ها و تجربه‌های اقتصاد اجتماعی و همبستگی.",
};

export default function FaHomePage() {
  return <ReferenceHome locale="fa" />;
}
