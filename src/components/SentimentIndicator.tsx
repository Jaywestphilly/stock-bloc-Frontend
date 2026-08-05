import React from "react";
import { StockTicker } from "../types";
import { SentimentGauge } from "./SentimentGauge";

export { SentimentGauge };

interface SentimentIndicatorProps {
  stock: StockTicker;
  compact?: boolean;
  showDetailsInModal?: boolean;
  onOpenNewsFeed?: () => void;
  className?: string;
}

export const SentimentIndicator: React.FC<SentimentIndicatorProps> = (
  props,
) => {
  return <SentimentGauge {...props} />;
};
