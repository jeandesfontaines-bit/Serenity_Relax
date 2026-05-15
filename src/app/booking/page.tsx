import BookingPageExperience from "@/components/landing/serenity2/BookingPageExperience";

type BookingPageProps = {
  searchParams?: Promise<{
    service?: string;
  }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;

  return <BookingPageExperience initialServiceId={params?.service} />;
}
