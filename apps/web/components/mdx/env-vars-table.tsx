"use client";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@while/ui";
import { Check, Copy, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface EnvVarLink {
  href: string;
  label: string;
}

interface EnvVar {
  name: string;
  description: React.ReactNode;
  howToGet?: React.ReactNode;
  howToGetLink?: EnvVarLink;
  default?: React.ReactNode;
  generate?: "base64";
}

interface EnvVarsTableProps {
  vars: EnvVar[];
}

const STORAGE_PREFIX = "while-env-";

function generateBase64Secret(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function EnvVarRow({ envVar, showHowToGet, showDefault }: {
  envVar: EnvVar;
  showHowToGet: boolean;
  showDefault: boolean;
}) {
  const [value, setValue] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${envVar.name}`);
    if (stored) {
      setValue(stored);
    }
  }, [envVar.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue) {
      localStorage.setItem(`${STORAGE_PREFIX}${envVar.name}`, newValue);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}${envVar.name}`);
    }
  };

  const handleGenerate = () => {
    const generated = generateBase64Secret();
    setValue(generated);
    localStorage.setItem(`${STORAGE_PREFIX}${envVar.name}`, generated);
  };

  const copyName = async () => {
    await navigator.clipboard.writeText(envVar.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const howToGetContent = envVar.howToGet ?? (
    envVar.howToGetLink ? (
      <Link
        href={envVar.howToGetLink.href}
        className="text-primary underline-offset-4 hover:underline"
      >
        {envVar.howToGetLink.label}
      </Link>
    ) : null
  );

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">
        <button
          type="button"
          onClick={copyName}
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
          title="Copy variable name"
        >
          <code className="bg-muted px-1.5 py-0.5 rounded">{envVar.name}</code>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{envVar.description}</TableCell>
      {showHowToGet && (
        <TableCell className="text-sm">{howToGetContent}</TableCell>
      )}
      {showDefault && (
        <TableCell className="text-sm font-mono">{envVar.default}</TableCell>
      )}
      <TableCell className="min-w-[200px]">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="Enter value..."
            className="h-8 text-sm font-mono"
          />
          {envVar.generate && !value && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="shrink-0 h-8"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Generate
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function EnvVarsTable({ vars }: EnvVarsTableProps) {
  const showHowToGet = vars.some(
    (v) => v.howToGet !== undefined || v.howToGetLink !== undefined,
  );
  const showDefault = vars.some((v) => v.default !== undefined);

  return (
    <div className="not-prose my-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variable</TableHead>
            <TableHead>Description</TableHead>
            {showHowToGet && <TableHead>How to Get</TableHead>}
            {showDefault && <TableHead>Default</TableHead>}
            <TableHead>Your Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vars.map((envVar) => (
            <EnvVarRow
              key={envVar.name}
              envVar={envVar}
              showHowToGet={showHowToGet}
              showDefault={showDefault}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
