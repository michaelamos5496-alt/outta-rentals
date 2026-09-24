import { OrderDetailPage } from "@/components/admin/order-detail-page";

export const metadata = { title: "Quote" };

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailPage id={id} section="quotes" />;
}
