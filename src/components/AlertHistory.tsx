
import { useState } from "react";
import { Alert, useUser } from "@/contexts/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AlertHistory = () => {
  const { userProfile, resolveAlert } = useUser();
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const alerts = userProfile?.alertHistory || [];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlert(alertId, "Manually resolved by user");
    toast.success("Alert marked as resolved");
  };

  const handleViewOnBlockchain = (txHash: string) => {
    // In a real app, this would link to a blockchain explorer
    window.open(`https://etherscan.io/tx/${txHash}`, "_blank");
  };

  const toggleExpandAlert = (alertId: string) => {
    if (expandedAlertId === alertId) {
      setExpandedAlertId(null);
    } else {
      setExpandedAlertId(alertId);
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Your recent emergency alerts will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <Clock className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-center text-muted-foreground">
              No alerts triggered yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>
          Your recent emergency alerts and their statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <>
                <TableRow 
                  key={alert.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpandAlert(alert.id)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      {alert.status === "active" ? (
                        <AlertTriangle className="h-4 w-4 text-alert-red mr-2" />
                      ) : alert.status === "resolved" ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      )}
                      <span className={alert.status === "active" ? "font-medium text-alert-red" : ""}>
                        {alert.status === "active"
                          ? "Active"
                          : alert.status === "resolved"
                          ? "Resolved"
                          : "False Alarm"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(alert.timestamp)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {alert.location.address ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{alert.location.address}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {alert.location.latitude.toFixed(4)},{" "}
                        {alert.location.longitude.toFixed(4)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {alert.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveAlert(alert.id);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                      {alert.blockchainTxHash && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOnBlockchain(alert.blockchainTxHash!);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {expandedAlertId === alert.id && (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-muted/30">
                      <div className="p-2 text-sm">
                        <div className="mb-2">
                          <span className="font-medium">Details:</span>
                          <p className="text-muted-foreground">
                            {alert.notes || "No additional notes available"}
                          </p>
                        </div>
                        {alert.respondedBy && alert.respondedBy.length > 0 && (
                          <div className="mb-2">
                            <span className="font-medium">Responded by:</span>
                            <ul className="list-disc list-inside ml-2">
                              {alert.respondedBy.map((contact) => (
                                <li key={contact.id} className="text-muted-foreground">
                                  {contact.name} ({contact.phoneNumber})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {alert.blockchainTxHash && (
                          <div>
                            <span className="font-medium">Blockchain Record:</span>
                            <p className="text-xs text-muted-foreground font-mono">
                              {alert.blockchainTxHash}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AlertHistory;
