import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  senderId: string;
  isGrouped?: boolean;
  isSending?: boolean;
  error?: string;
  onResend?: () => void;
}

export function ChatMessage({ 
  user, 
  avatar, 
  message, 
  timestamp, 
  senderId,
  isGrouped = false,
  isSending,
  error,
  onResend 
}: ChatMessageProps) {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?._id === senderId;

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  };

  return (
    <div className={cn(
      "flex items-end gap-2",
      isGrouped ? "mt-0.5" : "mt-3",
      isOwner && "flex-row-reverse"
    )}>
      <div className="w-6 shrink-0 sticky top-0 self-start">
        {!isGrouped && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatar} />
            <AvatarFallback>{user?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn(
        "flex flex-col max-w-[75%]",
        isOwner && "items-end"
      )}>
        {!isGrouped && (
          <span className="text-xs text-muted-foreground px-1 mb-1">
            {isOwner ? 'Bạn' : user}
          </span>
        )}

        <div className="group">
          <div className={cn(
            "relative px-3 py-1.5",
            "rounded-2xl text-sm break-words",
            "transition-spacing duration-200",
            "group-hover:mb-5",
            isGrouped && (isOwner ? "mr-[2px]" : "ml-[2px]"),
            isOwner 
              ? cn(
                  "bg-primary text-primary-foreground",
                  isGrouped 
                    ? "rounded-tr-2xl"
                    : "rounded-tr-md"
                )
              : cn(
                  "bg-accent hover:bg-accent/80",
                  isGrouped
                    ? "rounded-tl-2xl"
                    : "rounded-tl-md"
                )
          )}>
            <p className="whitespace-pre-wrap">{message}</p>

            <div className={cn(
              "absolute -bottom-5 text-[10px] text-muted-foreground/70",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isOwner 
                ? "right-0"
                : "left-0"
            )}>
              {formatMessageTime(timestamp)}
            </div>

            {isSending && (
              <span className="text-xs text-muted-foreground ml-2">
                Đang gửi...
              </span>
            )}
            
            {error && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-destructive">{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onResend}
                >
                  Gửi lại
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 