import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import { LanguageCode } from "@/lib/languages"

interface TextToSpeechButtonProps {
  text: string
  voice?: string
  language?: LanguageCode // NEW: Language for TTS
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  className?: string
}

export const TextToSpeechButton = ({ 
  text, 
  voice = "Aria",
  language = "en", // Default to English
  variant = "outline",
  size = "sm",
  disabled = false,
  className = ""
}: TextToSpeechButtonProps) => {
  const { speak, stop, isLoading, isPlaying } = useTextToSpeech({ voice, language })

  const handleClick = () => {
    if (isPlaying) {
      stop()
    } else {
      speak(text)
    }
  }

  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (isPlaying) return <VolumeX className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  const getLabel = () => {
    if (isLoading) return "Generating..."
    if (isPlaying) return "Stop"
    return "Listen"
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
      aria-label={getLabel()}
    >
      {getIcon()}
      {size !== "icon" && <span className="ml-2">{getLabel()}</span>}
    </Button>
  )
}