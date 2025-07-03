"use client"

import * as React from "react"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MultiInputProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  maxItems?: number
  disabled?: boolean
}

export function MultiInput({
  values,
  onChange,
  placeholder = "Add item...",
  className,
  maxItems = 10,
  disabled = false
}: MultiInputProps) {
  const [inputValue, setInputValue] = React.useState("")

  const addItem = () => {
    if (inputValue.trim() && values.length < maxItems) {
      onChange([...values, inputValue.trim()])
      setInputValue("")
    }
  }

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || values.length >= maxItems}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={disabled || !inputValue.trim() || values.length >= maxItems}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {values.length > 0 && (
        <div className="space-y-1">
          {values.map((value, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted rounded-md"
            >
              <span className="flex-1 text-sm">{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={disabled}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {values.length >= maxItems && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxItems} items allowed
        </p>
      )}
    </div>
  )
} 