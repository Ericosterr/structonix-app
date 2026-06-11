"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { hoverZoom } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamMember } from "@data/team";
import { cn } from "@/lib/utils";

type TeamCardProps = {
  member: TeamMember;
  className?: string;
};

export function TeamCard({ member, className }: TeamCardProps) {
  return (
    <motion.div {...hoverZoom} className={cn(className)}>
      <Card className="overflow-hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={member.image}
            alt={member.name || "Team member"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <CardContent className="space-y-1 p-4">
          {member.name ? (
            <p className="font-semibold">{member.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{/* TODO: team member name */}</p>
          )}
          {member.position ? (
            <p className="text-sm text-muted-foreground">{member.position}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{/* TODO: team member position */}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
