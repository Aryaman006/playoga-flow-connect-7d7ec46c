import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, ArrowDownToLine, Loader2, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface WalletSectionProps {
  userId: string;
}

export const WalletSection = React.forwardRef<HTMLDivElement, WalletSectionProps>(
  ({ userId }, ref) => {
  const queryClient = useQueryClient();
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ["wallet", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as { balance: number } | null;
    },
    enabled: !!userId,
  });

  // Fetch withdrawal requests
  const { data: withdrawals } = useQuery({
    queryKey: ["withdrawals", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Array<{
        id: string;
        amount: number;
        status: string;
        created_at: string;
        upi_id: string | null;
      }>;
    },
    enabled: !!userId,
  });

  // Fetch commissions
  const { data: commissions } = useQuery({
    queryKey: ["commissions", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("commissions")
        .select("id, amount, created_at")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Array<{ id: string; amount: number; created_at: string }>;
    },
    enabled: !!userId,
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const body: Record<string, unknown> = {
        amount: Number(withdrawAmount),
      };

      if (paymentMethod === "upi") {
        body.upi_id = upiId;
      } else {
        body.bank_account_number = bankAccount;
        body.bank_ifsc = bankIfsc;
        body.bank_name = bankName;
      }

      const { data, error } = await supabase.functions.invoke("request-withdrawal", {
        body,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted!");
      setShowWithdrawForm(false);
      setWithdrawAmount("");
      setUpiId("");
      setBankAccount("");
      setBankIfsc("");
      setBankName("");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit withdrawal request");
    },
  });

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (wallet && amount > wallet.balance) {
      toast.error("Amount exceeds wallet balance");
      return;
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast.error("Enter your UPI ID");
      return;
    }
    if (paymentMethod === "bank" && (!bankAccount.trim() || !bankIfsc.trim())) {
      toast.error("Enter bank account and IFSC");
      return;
    }
    withdrawMutation.mutate();
  };

  const hasPendingWithdrawal = withdrawals?.some((w) => w.status === "pending");
  const balance = wallet?.balance || 0;

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-accent/20 text-accent-foreground border-accent/30";
      case "approved": return "bg-primary/20 text-primary border-primary/30";
      case "completed": return "bg-primary/30 text-primary-foreground border-primary/40";
      case "rejected": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          My Wallet
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="text-center p-4 rounded-lg bg-primary/10">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-3xl font-bold text-primary flex items-center justify-center gap-1">
            <IndianRupee className="w-6 h-6" />
            {balance}
          </p>
        </div>

        {/* Commissions earned */}
        {commissions && commissions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Commissions</p>
              {commissions.slice(0, 3).map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-primary">+₹{c.amount}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator />

        {/* Withdraw button */}
        {!showWithdrawForm ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowWithdrawForm(true)}
            disabled={balance <= 0 || hasPendingWithdrawal}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            {hasPendingWithdrawal ? "Withdrawal Pending" : "Request Withdrawal"}
          </Button>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-3">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Max ₹${balance}`}
                max={balance}
                min={1}
              />
            </div>

            {/* Payment method toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={paymentMethod === "upi" ? "default" : "outline"}
                onClick={() => setPaymentMethod("upi")}
              >
                UPI
              </Button>
              <Button
                type="button"
                size="sm"
                variant={paymentMethod === "bank" ? "default" : "outline"}
                onClick={() => setPaymentMethod("bank")}
              >
                Bank Transfer
              </Button>
            </div>

            {paymentMethod === "upi" ? (
              <div>
                <Label>UPI ID</Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <Label>IFSC Code</Label>
                  <Input
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    placeholder="IFSC code"
                  />
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank name"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={withdrawMutation.isPending} className="flex-1">
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowWithdrawForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Recent withdrawals */}
        {withdrawals && withdrawals.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Withdrawal History</p>
              {withdrawals.map((w) => (
                <div key={w.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      ₹{w.amount}
                    </span>
                  </div>
                  <Badge variant="outline" className={statusColor(w.status)}>
                    {w.status}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

WalletSection.displayName = "WalletSection";
