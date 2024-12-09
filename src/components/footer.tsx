import Link from "next/link";
import { Github, Mail, Facebook } from "lucide-react";

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1&to=truongnguyen.dev93@gmail.com";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-center gap-4 py-6">
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/VanTruongNg"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href={GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="h-5 w-5" />
          </Link>
          <Link
            href="https://facebook.com/6ixty6six"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Facebook className="h-5 w-5" />
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-center text-sm text-muted-foreground">
            Built by{" "}
            <Link
              href="https://github.com/VanTruongNg"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Nguyễn Văn Trường
            </Link>
            . UI inspired by{" "}
            <Link
              href="https://cuutruyen.net"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              cuutruyen.net
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Contact me at{" "}
            <Link
              href={GMAIL_COMPOSE_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              truongnguyen.dev93@gmail.com
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/terms"
            className="underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
