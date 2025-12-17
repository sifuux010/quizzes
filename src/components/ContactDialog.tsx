import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Mail, Phone, User } from "lucide-react";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export const ContactDialog = ({ open, onOpenChange, student }: ContactDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.contact_info")}</DialogTitle>
          <DialogDescription className="sr-only">
            Student contact details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("student.name_label")}</p>
              <p className="font-medium">{student.name}</p>
            </div>
          </div>
          {student.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("student.email_label")}</p>
                <a href={`mailto:${student.email}`} className="font-medium text-primary hover:underline">
                  {student.email}
                </a>
              </div>
            </div>
          )}
          {student.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("student.phone_label")}</p>
                <a href={`tel:${student.phone}`} className="font-medium text-primary hover:underline">
                  {student.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
