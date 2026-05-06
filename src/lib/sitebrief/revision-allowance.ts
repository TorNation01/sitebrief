import {
  estimateTierName,
  extraRevisionRoundPriceAudForTier,
  includedRevisionRoundsForTierName,
  type StoredInternalPriceEstimate,
} from "@/types/price-estimate";

export type RevisionAllowance = {
  tierName: string | null;
  includedRounds: number;
  extraPurchased: number;
  totalSlots: number;
  roundsCreated: number;
  remainingCreates: number;
  extraRoundPriceAud: number;
};

export function computeRevisionAllowance(params: {
  estimate: StoredInternalPriceEstimate | null;
  extraRevisionRoundsPurchased: number;
  roundsCreated: number;
}): RevisionAllowance {
  const tierName = params.estimate ? estimateTierName(params.estimate) : null;
  const includedRounds = includedRevisionRoundsForTierName(tierName);
  const extraPurchased = Math.max(0, Math.floor(params.extraRevisionRoundsPurchased));
  const totalSlots = includedRounds + extraPurchased;
  const roundsCreated = Math.max(0, params.roundsCreated);
  const remainingCreates = Math.max(0, totalSlots - roundsCreated);
  const extraRoundPriceAud = extraRevisionRoundPriceAudForTier(tierName);
  return {
    tierName,
    includedRounds,
    extraPurchased,
    totalSlots,
    roundsCreated,
    remainingCreates,
    extraRoundPriceAud,
  };
}
