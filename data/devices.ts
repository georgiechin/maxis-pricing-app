export type PlanData = {
  upfront: number;
  dap: number;
  monthly: number;
};

export type VariantData = {
  [plan: string]: PlanData;
};

export type Device = {
  model: string;
  brand: string;
  aliases: string[];
  variants: {
    [storage: string]: VariantData;
  };
};

export const devices: Device[] = [
  {
    brand: "Apple",
    model: "iPhone 16e",
    aliases: ["ip16e", "iphone", "iphone16e", "16e", "iphone 16e"],
    variants: {
      "128": {
        MP99: { upfront: 2500, dap: 960, monthly: 56 },
      },
      "256": {
        MP139: { upfront: 2883, dap: 1080, monthly: 55 },
      },
    },
  },
  {
    brand: "Honor",
    model: "Honor 600 Lite",
    aliases: ["honor", "honor600", "honor600lite", "600lite", "honor 600 lite"],
    variants: {
      default: {
        MP139: { upfront: 460, dap: 460, monthly: 0 },
      },
    },
  },
];