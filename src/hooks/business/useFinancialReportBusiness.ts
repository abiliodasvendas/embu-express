import { ExtratoMensal } from "@/types/financeiro";

export function useFinancialReportBusiness() {
  const processReport = (data: ExtratoMensal): ExtratoMensal => {
    return data;
  };

  return {
    processReport
  };
}
