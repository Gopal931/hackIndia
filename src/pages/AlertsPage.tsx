
import AlertHistory from "@/components/AlertHistory";
import Map from "@/components/Map";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Clock, CheckCircle } from "lucide-react";

const AlertsPage = () => {
  const { userProfile } = useUser();
  
  const activeAlerts = userProfile?.alertHistory.filter(
    (alert) => alert.status === "active"
  ) || [];
  
  const resolvedAlerts = userProfile?.alertHistory.filter(
    (alert) => alert.status === "resolved"
  ) || [];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Alert History</h1>
          <p className="text-muted-foreground">
            View and manage your emergency alerts
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active" className="relative">
            Active
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-alert-red text-[10px] text-white">
                {activeAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <AlertHistory />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BellRing className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Active Alerts</CardTitle>
                </div>
                <CardDescription>
                  You don't have any active emergency alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-center text-muted-foreground">
                  All your alerts have been resolved
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="border-alert-red">
                  <CardHeader className="pb-3 bg-alert-red/10">
                    <div className="flex items-center">
                      <BellRing className="text-alert-red h-5 w-5 mr-2 animate-pulse" />
                      <CardTitle className="text-alert-red">
                        Active Emergency Alert
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Triggered on {new Date(alert.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Map
                          alerts={[alert]}
                          currentLocation={alert.location}
                          className="h-60 mb-4"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Location</h3>
                          <p className="text-sm text-muted-foreground">
                            {alert.location.address ||
                              `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Status</h3>
                          <div className="flex items-center">
                            <span className="inline-block h-2 w-2 rounded-full bg-alert-red mr-2"></span>
                            <p className="text-sm font-medium text-alert-red">Active</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Blockchain Record</h3>
                          <p className="text-xs font-mono text-muted-foreground">
                            {alert.blockchainTxHash}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resolved" className="mt-6">
          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Resolved Alerts</CardTitle>
                </div>
                <CardDescription>
                  Your resolved emergency alerts history
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">
                  No resolved alerts found
                </p>
              </CardContent>
            </Card>
          ) : (
            <AlertHistory />
          )}
        </TabsContent>
        
        <TabsContent value="map" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Locations</CardTitle>
              <CardDescription>
                View all your emergency alerts on a map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Map
                alerts={userProfile?.alertHistory}
                currentLocation={{ latitude: 30.87767255, longitude: 76.8739735 }}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
