import type { BagDimensions, CabinClass } from "@/types";

export interface BaggageAllowance {
  personalItem: { maxDimensions: BagDimensions; included: boolean };
  carryOn: {
    included: boolean;
    maxDimensions: BagDimensions;
    maxWeightKg: number;
    feeUsd: number;
  };
  checked: {
    freeBags: number;
    maxWeightKg: number;
    maxDimensions: BagDimensions;
    feePerBagUsd: number;
    overweightFeeUsd: number;
    oversizeFeeUsd: number;
  };
}

const stdCarryOn: BagDimensions = { lengthCm: 56, widthCm: 36, heightCm: 23 };
const stdChecked: BagDimensions = { lengthCm: 158, widthCm: 158, heightCm: 158 };

type AirlineRules = Record<CabinClass, BaggageAllowance>;

export const AIRLINE_BAGGAGE_RULES: Record<string, AirlineRules> = {
  United: {
    basic_economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 25, heightCm: 22 }, included: true },
      carryOn: { included: false, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 65 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 40, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 25, heightCm: 22 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 65 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 40, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    premium_economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 25, heightCm: 22 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 65 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 40, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    business: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 25, heightCm: 22 }, included: true },
      carryOn: { included: true, maxDimensions: { lengthCm: 56, widthCm: 36, heightCm: 26 }, maxWeightKg: 18, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    first: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 25, heightCm: 22 }, included: true },
      carryOn: { included: true, maxDimensions: { lengthCm: 56, widthCm: 36, heightCm: 26 }, maxWeightKg: 18, feeUsd: 0 },
      checked: { freeBags: 3, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
  },
  Delta: {
    basic_economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: false, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    premium_economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 1, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    business: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    first: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
  },
  Southwest: {
    basic_economy: {
      personalItem: { maxDimensions: { lengthCm: 41, widthCm: 24, heightCm: 25 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 75, oversizeFeeUsd: 75 },
    },
    economy: {
      personalItem: { maxDimensions: { lengthCm: 41, widthCm: 24, heightCm: 25 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 75, oversizeFeeUsd: 75 },
    },
    premium_economy: {
      personalItem: { maxDimensions: { lengthCm: 41, widthCm: 24, heightCm: 25 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 75, oversizeFeeUsd: 75 },
    },
    business: {
      personalItem: { maxDimensions: { lengthCm: 41, widthCm: 24, heightCm: 25 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 75, oversizeFeeUsd: 75 },
    },
    first: {
      personalItem: { maxDimensions: { lengthCm: 41, widthCm: 24, heightCm: 25 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 75, oversizeFeeUsd: 75 },
    },
  },
  American: {
    basic_economy: {
      personalItem: { maxDimensions: { lengthCm: 45, widthCm: 35, heightCm: 20 }, included: true },
      carryOn: { included: false, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    economy: {
      personalItem: { maxDimensions: { lengthCm: 45, widthCm: 35, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    premium_economy: {
      personalItem: { maxDimensions: { lengthCm: 45, widthCm: 35, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 1, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    business: {
      personalItem: { maxDimensions: { lengthCm: 45, widthCm: 35, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
    first: {
      personalItem: { maxDimensions: { lengthCm: 45, widthCm: 35, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 3, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 200 },
    },
  },
  JetBlue: {
    basic_economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: false, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 35 },
      checked: { freeBags: 0, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    premium_economy: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 35, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    business: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    first: {
      personalItem: { maxDimensions: { lengthCm: 43, widthCm: 33, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: stdCarryOn, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 32, maxDimensions: stdChecked, feePerBagUsd: 0, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
  },
  Spirit: {
    basic_economy: {
      personalItem: { maxDimensions: { lengthCm: 46, widthCm: 36, heightCm: 20 }, included: true },
      carryOn: { included: false, maxDimensions: { lengthCm: 56, widthCm: 38, heightCm: 36 }, maxWeightKg: 11, feeUsd: 69 },
      checked: { freeBags: 0, maxWeightKg: 18, maxDimensions: { lengthCm: 158, widthCm: 158, heightCm: 158 }, feePerBagUsd: 59, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    economy: {
      personalItem: { maxDimensions: { lengthCm: 46, widthCm: 36, heightCm: 20 }, included: true },
      carryOn: { included: false, maxDimensions: { lengthCm: 56, widthCm: 38, heightCm: 36 }, maxWeightKg: 11, feeUsd: 69 },
      checked: { freeBags: 0, maxWeightKg: 18, maxDimensions: stdChecked, feePerBagUsd: 59, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    premium_economy: {
      personalItem: { maxDimensions: { lengthCm: 46, widthCm: 36, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: { lengthCm: 56, widthCm: 38, heightCm: 36 }, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 1, maxWeightKg: 18, maxDimensions: stdChecked, feePerBagUsd: 59, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    business: {
      personalItem: { maxDimensions: { lengthCm: 46, widthCm: 36, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: { lengthCm: 56, widthCm: 38, heightCm: 36 }, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 1, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 59, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
    first: {
      personalItem: { maxDimensions: { lengthCm: 46, widthCm: 36, heightCm: 20 }, included: true },
      carryOn: { included: true, maxDimensions: { lengthCm: 56, widthCm: 38, heightCm: 36 }, maxWeightKg: 11, feeUsd: 0 },
      checked: { freeBags: 2, maxWeightKg: 23, maxDimensions: stdChecked, feePerBagUsd: 59, overweightFeeUsd: 100, oversizeFeeUsd: 150 },
    },
  },
};

export function bagVolume(d: BagDimensions): number {
  return d.lengthCm * d.widthCm * d.heightCm;
}

export function fitsDimensions(bag: BagDimensions, limit: BagDimensions): boolean {
  const bagSorted = [bag.lengthCm, bag.widthCm, bag.heightCm].sort((a, b) => b - a);
  const limitSorted = [limit.lengthCm, limit.widthCm, limit.heightCm].sort((a, b) => b - a);
  return bagSorted[0] <= limitSorted[0] && bagSorted[1] <= limitSorted[1] && bagSorted[2] <= limitSorted[2];
}

export function linearDimensions(d: BagDimensions): number {
  return d.lengthCm + d.widthCm + d.heightCm;
}
