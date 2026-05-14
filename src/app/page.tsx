import Home from '@/components/landing/serenity2/Home';
import { normalizeLandingVariant } from "@/components/landing/serenity2/types";

type HomePageProps = {
  searchParams?: Promise<{
    variant?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const variant = normalizeLandingVariant(params?.variant);

  return <Home variant={variant} />;
}
