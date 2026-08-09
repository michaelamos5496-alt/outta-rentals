"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kitPresets } from "@/lib/placeholder-data";
import type { FieldErrors, ProjectDetails } from "@/lib/quote/types";

export interface ProjectDetailsStepProps {
  value: ProjectDetails;
  onChange: (patch: Partial<ProjectDetails>) => void;
  errors: FieldErrors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

function ProjectDetailsStep({ value, onChange, errors }: ProjectDetailsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          className="mt-1.5"
          placeholder="Feature film, Lagos"
          value={value.projectName}
          onChange={(e) => onChange({ projectName: e.target.value })}
        />
        <FieldError message={errors.projectName} />
      </div>

      <div>
        <Label htmlFor="project-type">Project type</Label>
        <Select value={value.projectType} onValueChange={(v) => onChange({ projectType: v })}>
          <SelectTrigger id="project-type" className="mt-1.5 w-full">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {kitPresets.map((preset) => (
              <SelectItem key={preset.name} value={preset.name}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.projectType} />
      </div>

      <div>
        <Label htmlFor="shoot-location">Shoot location</Label>
        <Input
          id="shoot-location"
          className="mt-1.5"
          placeholder="Accra"
          value={value.shootLocation}
          onChange={(e) => onChange({ shootLocation: e.target.value })}
        />
        <FieldError message={errors.shootLocation} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="production-days">Production days</Label>
          <Input
            id="production-days"
            className="mt-1.5"
            inputMode="numeric"
            placeholder="3"
            value={value.productionDays}
            onChange={(e) => onChange({ productionDays: e.target.value })}
          />
          <FieldError message={errors.productionDays} />
        </div>
        <div>
          <Label htmlFor="crew-size">Crew size</Label>
          <Input
            id="crew-size"
            className="mt-1.5"
            inputMode="numeric"
            placeholder="8"
            value={value.crewSize}
            onChange={(e) => onChange({ crewSize: e.target.value })}
          />
          <FieldError message={errors.crewSize} />
        </div>
      </div>

      <div>
        <Label htmlFor="additional-notes">Additional notes</Label>
        <Textarea
          id="additional-notes"
          className="mt-1.5"
          rows={3}
          placeholder="Anything OUTTA should know about the shoot…"
          value={value.additionalNotes}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
        />
      </div>
    </div>
  );
}

export { ProjectDetailsStep, FieldError };
