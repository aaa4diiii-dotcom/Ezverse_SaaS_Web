import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Coins, Clock, ArrowLeft, Loader2, User, UserCheck, Shield, HelpCircle, Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction History — Ezverse" },
      { name: "description", content: "View your purchase history and credit transactions." },
    ],
  }),
  component: TransactionsPage,
});

interface Transaction {
  id: string;
  user_id: string;
  tool_id: string | null;
  input_data: any;
  output_data: any;
  credits_used: number;
  status: string;
  created_at: string;
  // mapped properties
  user_email?: string;
  user_name?: string;
  tool_name?: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "admin">("personal");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        // 1. Check if user is admin
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;
        const userIsAdmin = roles?.some((r: any) => r.role === "admin") || false;
        if (isMounted) {
          setIsAdmin(userIsAdmin);
          if (userIsAdmin) {
            setActiveTab("admin");
          }
        }

        // 2. Fetch tools to map tool names
        const { data: tools, error: toolsError } = await supabase
          .from("tools")
          .select("id, name");
        if (toolsError) throw toolsError;
        const toolMap = new Map<string, string>();
        tools?.forEach((t: any) => toolMap.set(t.id, t.name));

        // 3. Fetch transactions
        let txQuery = supabase.from("transactions").select("*");
        
        // If not admin, restrict query to user's transactions (enforced by RLS anyway)
        if (!userIsAdmin) {
          txQuery = txQuery.eq("user_id", user.id);
        }
        
        const { data: txs, error: txError } = await txQuery.order("created_at", { ascending: false });
        if (txError) throw txError;

        let mappedTxs: Transaction[] = (txs || []).map((tx: any) => ({
          ...tx,
          tool_name: tx.tool_id ? toolMap.get(tx.tool_id) || "Unknown Tool" : undefined
        }));

        // 4. Fetch profiles if admin to show user emails and names
        if (userIsAdmin) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, email, name");
          
          if (!profilesError && profiles) {
            const profileMap = new Map<string, { email: string; name: string }>();
            profiles.forEach((p: any) => profileMap.set(p.id, { email: p.email || "", name: p.name || "" }));
            
            mappedTxs = mappedTxs.map(tx => {
              const p = profileMap.get(tx.user_id);
              return {
                ...tx,
                user_email: p?.email || "Unknown User",
                user_name: p?.name || "No Name"
              };
            });
          }
        }

        if (isMounted) {
          setTransactions(mappedTxs);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load transactions");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <SiteLayout>
        <section className="container-page py-24 text-center">
          <Coins className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Sign in to view transaction history</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please log in to manage your account details and view billing.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center h-10 px-5 text-sm font-semibold border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center h-10 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // Filter transactions based on active tab
  const displayedTransactions = activeTab === "admin" && isAdmin 
    ? transactions 
    : transactions.filter(t => t.user_id === user?.id);

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-8">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm text-muted-foreground">Back to Dashboard</span>
        </div>

        <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Coins className="h-8 w-8 text-primary" /> Billing & Transactions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin 
                ? "View and manage credit token purchases and usage across all users." 
                : "View your purchase history, signup bonuses, and credit consumption."}
            </p>
          </div>
          <Button
            onClick={() => router.invalidate()}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {isAdmin && (
          <div className="mt-8 flex gap-2 border-b border-border pb-px">
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-3 text-sm font-semibold px-4 transition-colors relative ${
                activeTab === "admin"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                All Purchases (Admin View)
              </div>
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-3 text-sm font-semibold px-4 transition-colors relative ${
                activeTab === "personal"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Transactions
              </div>
            </button>
          </div>
        )}
      </section>

      <section className="container-page pb-24">
        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Loading transactions…</span>
            </div>
          ) : displayedTransactions.length === 0 ? (
            <div className="py-20 text-center">
              <Coins className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground font-semibold">No transactions found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeTab === "admin" 
                  ? "No credit purchases or transactions have been logged in the system yet."
                  : "You haven't bought or spent any credit tokens yet."}
              </p>
              {activeTab === "personal" && (
                <Link to="/pricing" className="mt-4 inline-block">
                  <Button size="sm">Top up credits</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    {activeTab === "admin" && isAdmin && (
                      <TableHead>User Details</TableHead>
                    )}
                    <TableHead>Description</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.map((tx) => {
                    const isCreditAdd = tx.credits_used < 0;
                    const displayCredits = isCreditAdd ? Math.abs(tx.credits_used) : tx.credits_used;
                    
                    // Determine description
                    let description = "Transaction";
                    let amountStr = "—";
                    
                    if (tx.status === "signup_bonus") {
                      description = "Signup Bonus";
                    } else if (tx.status === "purchase") {
                      description = tx.input_data?.plan 
                        ? `${tx.input_data.plan.charAt(0).toUpperCase() + tx.input_data.plan.slice(1)} Top-up`
                        : "Credit Purchase";
                      
                      if (tx.input_data?.price !== undefined) {
                        const symbol = tx.input_data.currency === "usd" ? "$" : "₹";
                        amountStr = `${symbol}${tx.input_data.price}`;
                      }
                    } else if (tx.tool_id) {
                      description = `Ran Tool: ${tx.tool_name}`;
                    }

                    return (
                      <TableRow key={tx.id} className="hover:bg-surface-2 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(tx.created_at)}
                          </div>
                        </TableCell>
                        
                        {activeTab === "admin" && isAdmin && (
                          <TableCell className="text-xs whitespace-nowrap">
                            <div className="font-semibold text-foreground text-sm">{tx.user_name || "No Name"}</div>
                            <div className="text-muted-foreground">{tx.user_email}</div>
                            <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5" title="User UID">
                              UID: {tx.user_id}
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell className="text-sm">
                          <div className="font-medium text-foreground">{description}</div>
                          {tx.status === "purchase" && tx.input_data?.stripe_session_id && (
                            <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate max-w-[200px]" title={tx.input_data.stripe_session_id}>
                              ID: {tx.input_data.stripe_session_id}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="font-bold text-sm whitespace-nowrap">
                          <span className={isCreditAdd ? "text-emerald-500" : "text-foreground/75"}>
                            {isCreditAdd ? "+" : "-"}{displayCredits.toLocaleString()}
                          </span>
                        </TableCell>
                        
                        <TableCell className="font-medium text-sm">
                          {amountStr}
                        </TableCell>
                        
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === "completed" || tx.status === "signup_bonus" || tx.status === "purchase"
                                ? "default"
                                : "destructive"
                            }
                            className={`capitalize text-[10px] ${
                              tx.status === "purchase" || tx.status === "signup_bonus"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : tx.status === "completed"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : ""
                            }`}
                          >
                            {tx.status === "completed" ? "Success" : tx.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
