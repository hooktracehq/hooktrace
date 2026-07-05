"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { useUpdateAggregation } from "@/hooks/aggregation/use-update-aggregation"

import type {
  AggregationConfig,
  AggregationRule,
} from "@/types/aggregation"

type Props = {
  rule: AggregationRule
  onClose: () => void
}

export function EditAggregationDialog({
  rule,
  onClose,
}: Props) {
  const updateAggregation =
    useUpdateAggregation()

  const [name, setName] =
    useState(rule.name)

  const [provider, setProvider] =
    useState(rule.provider ?? "")

  const [patterns, setPatterns] =
    useState(rule.eventPatterns.join("\n"))

  const [mode, setMode] =
    useState<AggregationConfig["mode"]>(
      rule.config.mode
    )

  const [windowMs, setWindowMs] =
    useState(rule.config.windowMs ?? 1000)

  const [batchSize, setBatchSize] =
    useState(rule.config.maxBatchSize ?? 100)

  const [timeoutMs, setTimeoutMs] =
    useState(rule.config.timeoutMs ?? 10000)

  const [
    maxEventsPerSecond,
    setMaxEventsPerSecond,
  ] = useState(
    rule.config.maxEventsPerSecond ?? 0
  )

  const [
    deduplicate,
    setDeduplicate,
  ] = useState(
    rule.config.deduplicate ?? false
  )

  const [
    deduplicationKey,
    setDeduplicationKey,
  ] = useState(
    rule.config.deduplicationKey ?? ""
  )

  function handleSave() {
    updateAggregation.mutate(
      {
        id: rule.id,
        data: {
          name,
          provider:
            provider.trim() || null,

          eventPatterns: patterns
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean),

          config: {
            mode,
            windowMs,
            maxBatchSize: batchSize,
            timeoutMs,
            maxEventsPerSecond,
            deduplicate,
            deduplicationKey:
              deduplicationKey.trim() ||
              null,
          },
        },
      },
      {
        onSuccess() {
          onClose()
        },
      }
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl">

        <DialogHeader>

          <DialogTitle>
            Edit Aggregation Rule
          </DialogTitle>

        </DialogHeader>

        <div className="space-y-6">

          <div className="space-y-2">

            <Label>Rule Name</Label>

            <Input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

          <div className="space-y-2">

            <Label>Provider</Label>

            <Input
              value={provider}
              placeholder="stripe"
              onChange={(e) =>
                setProvider(
                  e.target.value
                )
              }
            />

          </div>

          <div className="space-y-2">

            <Label>
              Event Patterns
            </Label>

            <Textarea
              rows={5}
              value={patterns}
              placeholder="invoice.created&#10;invoice.paid"
              onChange={(e) =>
                setPatterns(
                  e.target.value
                )
              }
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">

              <Label>Mode</Label>

              <Select
                value={mode}
                onValueChange={(
                  value: string
                ) =>
                  setMode(
                    value as AggregationConfig["mode"]
                  )
                }
              >
                <SelectTrigger>

                  <SelectValue />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="batch">
                    Batch
                  </SelectItem>

                  <SelectItem value="window">
                    Window
                  </SelectItem>

                  <SelectItem value="rate_limit">
                    Rate Limit
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            <div className="space-y-2">

              <Label>
                Window (ms)
              </Label>

              <Input
                type="number"
                value={windowMs}
                onChange={(e) =>
                  setWindowMs(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Max Batch Size
              </Label>

              <Input
                type="number"
                value={batchSize}
                onChange={(e) =>
                  setBatchSize(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Timeout (ms)
              </Label>

              <Input
                type="number"
                value={timeoutMs}
                onChange={(e) =>
                  setTimeoutMs(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Max Events / Second
              </Label>

              <Input
                type="number"
                value={
                  maxEventsPerSecond
                }
                onChange={(e) =>
                  setMaxEventsPerSecond(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Deduplication Key
              </Label>

              <Input
                value={
                  deduplicationKey
                }
                onChange={(e) =>
                  setDeduplicationKey(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">

            <div>

              <p className="font-medium">
                Deduplication
              </p>

              <p className="text-sm text-muted-foreground">
                Skip duplicate events.
              </p>

            </div>

            <Switch
              checked={deduplicate}
              onCheckedChange={
                setDeduplicate
              }
            />

          </div>

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={
              updateAggregation.isPending
            }
          >
            {updateAggregation.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}