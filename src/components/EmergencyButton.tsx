
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const EmergencyButton = () => {
  const { triggerSOS } = useUser();
  const { isConnected, sendTransaction } = useWeb3();
  const [isTriggering, setIsTriggering] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleSOSPress = () => {
    // Start countdown
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(null);
        triggerAlert();
      }
    }, 1000);
    
    // Allow cancellation
    return () => {
      clearInterval(timer);
      setCountdown(null);
    };
  };
  
  const triggerAlert = async () => {
    setIsTriggering(true);
    try {
      const alert = await triggerSOS();
      
      toast.success("SOS alert triggered successfully");
      
      // If blockchain is connected, record on chain
      if (isConnected) {
        try {
          const txHash = await sendTransaction("recordSOSAlert", [
            alert.timestamp,
            JSON.stringify(alert.location),
          ]);
          console.log("Alert recorded on blockchain with tx:", txHash);
        } catch (error) {
          console.error("Failed to record on blockchain:", error);
          toast.error("Alert triggered but blockchain recording failed");
        }
      }
      
      // Simulate sending notifications to contacts
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.info("Alert sent to emergency contacts");
      
    } catch (error) {
      console.error("Failed to trigger SOS:", error);
      toast.error("Failed to trigger SOS alert");
    } finally {
      setIsTriggering(false);
    }
  };
  
  const cancelAlert = () => {
    setCountdown(null);
    toast.info("SOS alert cancelled");
  };

  if (countdown !== null) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-2">
          <p className="text-lg font-semibold">Sending SOS in</p>
          <p className="text-5xl font-bold text-alert-red">{countdown}</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 border-alert-red text-alert-red hover:bg-alert-red/10"
          onClick={cancelAlert}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="sos-button h-32 w-32 rounded-full bg-alert-red hover:bg-alert-red/90 text-white flex flex-col items-center justify-center gap-2 animate-pulse-scale"
      disabled={isTriggering}
      onClick={handleSOSPress}
    >
      {isTriggering ? (
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
          <span className="text-sm mt-1">Sending...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <ShieldAlert className="h-10 w-10" />
          <span className="text-lg font-bold mt-1">SOS</span>
        </div>
      )}
    </Button>
  );
};

export default EmergencyButton;
