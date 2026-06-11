"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  calculateConstructionPrice,
  calculateStructurePrice,
  formatPrice,
  type ConstructionMode,
} from "@/lib/calculators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CalculatorType = "structure" | "construction";

type CalculatorCardProps = {
  type: CalculatorType;
  className?: string;
};

export function CalculatorCard({ type, className }: CalculatorCardProps) {
  const t = useTranslations("common");
  const tCalc = useTranslations("calculator");
  const locale = useLocale();
  const [area, setArea] = useState("");
  const [mode, setMode] = useState<ConstructionMode>("standard");

  const price = useMemo(() => {
    const parsedArea = Number(area);
    if (type === "structure") {
      return calculateStructurePrice(parsedArea);
    }
    return calculateConstructionPrice(parsedArea, mode);
  }, [area, mode, type]);

  const title =
    type === "structure" ? tCalc("structureTitle") : tCalc("constructionTitle");

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`area-${type}`}>{t("area")}</Label>
          <Input
            id={`area-${type}`}
            type="number"
            min="0"
            step="0.01"
            value={area}
            onChange={(event) => setArea(event.target.value)}
          />
        </div>
        {type === "construction" ? (
          <div className="space-y-2">
            <Label>{t("mode")}</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as ConstructionMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  {t("standard")} — {tCalc("standardRate")}
                </SelectItem>
                <SelectItem value="premium">
                  {t("premium")} — {tCalc("premiumRate")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="rounded-[var(--radius-button)] bg-secondary p-4">
          <p className="text-sm text-muted-foreground">{t("estimatedPrice")}</p>
          <p className="text-2xl font-semibold">{formatPrice(price, locale)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
