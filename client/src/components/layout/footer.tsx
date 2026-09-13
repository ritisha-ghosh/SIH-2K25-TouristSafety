import { useLanguage } from "@/components/language-provider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-background/95 backdrop-blur mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              {t("app_title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              Advanced monitoring and response system for tourist safety in
              India's Northeast region.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">
              Emergency Contacts
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Emergency: 112</p>
              <p>Tourist Helpline: 1363</p>
              <p>Police: 100</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">System Status</h4>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 "Smart Tiurist Safety" by Team "RuleBreakers" | All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
