export type Speaker = "wiz" | "user";

export interface ChatLine {
  speaker: Speaker;
  text: string;
  /** ms to wait BEFORE showing the typing indicator for this message */
  pauseBefore: number;
  /** ms the typing indicator shows before message appears */
  typingDuration: number;
}

export interface MsgBubble {
  speaker: Speaker;
  text: string;
  id: number;
}
