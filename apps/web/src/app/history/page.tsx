import { Activity } from "@/features/history/activity";
import { PageTitle } from "@/components/ui/product-ui";
export default function History() {
  return (
    <>
      <PageTitle
        eyebrow="MOVIMIENTOS"
        title="Cada envío tiene su historia."
        description="Consulta el estado y los detalles de tus operaciones."
      />
      <Activity />
    </>
  );
}
