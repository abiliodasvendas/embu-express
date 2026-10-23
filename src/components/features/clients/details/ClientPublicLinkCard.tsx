import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, ExternalLink, Copy, CopyCheck } from "lucide-react";

interface ClientPublicLinkCardProps {
  publicId?: string | null;
  isCopied: boolean;
  onCopy: () => void;
}

export function ClientPublicLinkCard({
  publicId,
  isCopied,
  onCopy,
}: ClientPublicLinkCardProps) {
  if (!publicId) return null;

  const publicUrl = `${window.location.origin}/public/c/${publicId}`;

  return (
    <Card className="rounded-[18px] border border-border bg-card shadow-xs">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Link de Acesso Público</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Compartilhe este link com o cliente para acesso rápido dos relatórios.
        </p>
        <div className="flex flex-col gap-3">
          <div className="bg-muted/40 border border-border px-3.5 py-2.5 rounded-[14px] flex items-center justify-between text-xs font-mono text-foreground">
            <span className="truncate">
              {`/public/c/${publicId.substring(0, 12)}...`}
            </span>
            <ExternalLink
              className="h-4 w-4 text-muted-foreground shrink-0 ml-2 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => window.open(publicUrl, "_blank")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-semibold text-xs flex items-center justify-center gap-2"
            onClick={onCopy}
          >
            {isCopied ? (
              <>
                <CopyCheck className="h-4 w-4 text-foreground" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span>Copiar Link</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
