import { OrderDetailPage } from "@/components/admin/order-detail-page";

export const metadata = { title: "Order" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailPage id={id} section="orders" />;
}
