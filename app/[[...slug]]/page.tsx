import { SwiipRouter } from "@/components/swiip-router";

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  return <SwiipRouter path={`/${slug.join("/")}`} />;
}
