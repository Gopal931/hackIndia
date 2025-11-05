import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { sendAlertEmail } from "@/services/emailService";

export type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  walletAddress?: string;
  isEmergencyContact: boolean;
};

export type Alert = {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: "active" | "resolved" | "false_alarm";
  respondedBy?: Contact[];
  notes?: string;
  blockchainTxHash?: string;
};

export type UserProfile = {
  name: string;
  phoneNumber: string;
  email: string;
  walletAddress?: string;
  emergencyContacts: Contact[];
  alertHistory: Alert[];
};

export type UserContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addEmergencyContact: (contact: EmergencyContact) => Promise<void>;
  removeEmergencyContact: (contactId: string) => Promise<void>;
  triggerSOS: () => Promise<void>;
  shareLocation: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock data
const mockProfile: UserProfile = {
  name: "Jane Doe",
  phoneNumber: "+1 555-123-4567",
  email: "jane.doe@example.com",
  walletAddress: "0x1234...5678",
  emergencyContacts: [
    {
      id: "1",
      name: "John Smith",
      phoneNumber: "+1 555-987-6543",
      email: "john.smith@example.com",
      walletAddress: "0x8765...4321",
      isEmergencyContact: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      phoneNumber: "+1 555-456-7890",
      email: "sarah.j@example.com",
      isEmergencyContact: true,
    },
  ],
  alertHistory: [
    {
      id: "alert1",
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York, NY",
      },
      status: "resolved",
      respondedBy: [
        {
          id: "1",
          name: "John Smith",
          phoneNumber: "+1 555-987-6543",
          email: "john.smith@example.com",
          isEmergencyContact: true,
        },
      ],
      notes: "False alarm, accidentally triggered",
      blockchainTxHash: "0xabcd...1234",
    },
  ],
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (email: string, password: string) => {
    // Simulating API call
    console.log("Logging in with", email, password);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Create a new profile with the user's email
    const newProfile: UserProfile = {
      name: email.split('@')[0], // Use the part before @ as the name
      phoneNumber: "",
      email: email,
      walletAddress: "",
      emergencyContacts: [],
      alertHistory: [],
    };
    
    setUserProfile(newProfile);
    setIsLoggedIn(true);
    return true;
  };

  const logout = () => {
    setUserProfile(null);
    setIsLoggedIn(false);
  };

  const triggerSOS = async () => {
    if (!userProfile) {
      toast.error("You must be logged in to trigger an SOS alert");
      return;
    }

    try {
      // Get current location
      const position = await getCurrentPosition();
      
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        timestamp: Date.now(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        status: "active",
        blockchainTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
      };
      
      // Update user profile with new alert
      setUserProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          alertHistory: [newAlert, ...prev.alertHistory],
        };
      });

      // Send email notifications to emergency contacts
      const emergencyContacts = userProfile.emergencyContacts.filter(
        contact => contact.isEmergencyContact && contact.email
      );

      if (emergencyContacts.length === 0) {
        toast.warning("No emergency contacts found to notify");
      } else {
        toast.info(`Sending alerts to ${emergencyContacts.length} emergency contacts...`);
        
        let successCount = 0;
        let failureCount = 0;

        // Send emails to all emergency contacts
        for (const contact of emergencyContacts) {
          const success = await sendAlertEmail(
            contact.email,
            userProfile.name,
            newAlert.location,
            newAlert.timestamp
          );

          if (success) {
            successCount++;
            console.log(`Alert sent successfully to ${contact.name} (${contact.email})`);
          } else {
            failureCount++;
            console.error(`Failed to send alert to ${contact.name} (${contact.email})`);
          }
        }

        // Show appropriate notifications
        if (successCount > 0) {
          toast.success(`Alert sent to ${successCount} emergency contact${successCount > 1 ? 's' : ''}`);
        }
        if (failureCount > 0) {
          toast.error(`Failed to send alert to ${failureCount} contact${failureCount > 1 ? 's' : ''}`);
        }
      }
      
      return newAlert;
    } catch (error) {
      console.error("Failed to trigger SOS:", error);
      toast.error("Failed to trigger SOS alert");
      throw error;
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const addContact = (contact: Omit<Contact, "id">) => {
    setUserProfile((prev) => {
      if (!prev) return prev;
      const newContact = {
        ...contact,
        id: `contact-${Date.now()}`,
      };
      return {
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, newContact],
      };
    });
  };

  const removeContact = (id: string) => {
    setUserProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter(
          (contact) => contact.id !== id
        ),
      };
    });
  };

  const updateContact = (id: string, updatedFields: Partial<Contact>) => {
    setUserProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        emergencyContacts: prev.emergencyContacts.map((contact) =>
          contact.id === id ? { ...contact, ...updatedFields } : contact
        ),
      };
    });
  };

  const resolveAlert = (id: string, notes?: string) => {
    setUserProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        alertHistory: prev.alertHistory.map((alert) =>
          alert.id === id
            ? {
                ...alert,
                status: "resolved",
                notes: notes || alert.notes,
              }
            : alert
        ),
      };
    });
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        isLoggedIn,
        login,
        logout,
        triggerSOS,
        addContact,
        removeContact,
        updateContact,
        resolveAlert,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
