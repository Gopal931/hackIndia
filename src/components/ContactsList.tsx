import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Contact, useUser } from "@/contexts/UserContext";
import { User, UserPlus, Phone, Mail, Wallet, Trash2, Shield, Camera } from "lucide-react";
import { toast } from "sonner";
import { Camera as CameraComponent } from "./Camera";
import { sendPhotoEmail } from "@/services/emailService";

const ContactsList = () => {
  const { userProfile, addContact, removeContact, updateContact } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Omit<Contact, "id">>({
    name: "",
    phoneNumber: "",
    email: "",
    walletAddress: "",
    isEmergencyContact: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewContact((prev) => ({
      ...prev,
      isEmergencyContact: checked,
    }));
  };

  const resetForm = () => {
    setNewContact({
      name: "",
      phoneNumber: "",
      email: "",
      walletAddress: "",
      isEmergencyContact: true,
    });
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phoneNumber) {
      toast.error("Name and phone number are required");
      return;
    }

    addContact(newContact);
    toast.success(`${newContact.name} added to your contacts`);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleRemoveContact = (id: string, name: string) => {
    removeContact(id);
    toast.info(`${name} removed from your contacts`);
  };

  const handleToggleEmergency = (id: string, name: string, current: boolean) => {
    updateContact(id, { isEmergencyContact: !current });
    toast.success(
      `${name} is ${!current ? "now" : "no longer"} an emergency contact`
    );
  };

  const handlePhotoCapture = async (photoData: string) => {
    if (!selectedContact?.email) {
      toast.error("No email address found for this contact");
      return;
    }

    try {
      await sendPhotoEmail(selectedContact.email, photoData);
      toast.success(`Photo sent to ${selectedContact.name}`);
      setIsCameraDialogOpen(false);
    } catch (error) {
      toast.error("Failed to send photo. Please try again.");
    }
  };

  const openCameraDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setIsCameraDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trusted Contacts</CardTitle>
        <CardDescription>
          Manage your emergency contacts who will be notified in case of an SOS alert
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userProfile?.emergencyContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Shield className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-center text-muted-foreground">
              You don't have any trusted contacts yet
            </p>
            <p className="text-center text-muted-foreground text-sm">
              Add contacts who will be notified in case of emergency
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userProfile?.emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start justify-between p-4 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-full p-2">
                    <User className="h-5 w-5 text-safety-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">{contact.name}</h4>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-2" />
                        {contact.phoneNumber}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-2" />
                        {contact.email}
                      </div>
                      {contact.walletAddress && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Wallet className="h-3 w-3 mr-2" />
                          {contact.walletAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      Emergency
                    </span>
                    <Switch
                      checked={contact.isEmergencyContact}
                      onCheckedChange={() =>
                        handleToggleEmergency(
                          contact.id,
                          contact.name,
                          contact.isEmergencyContact
                        )
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openCameraDialog(contact)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveContact(contact.id, contact.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-safety-purple hover:bg-safety-purple-dark text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Trusted Contact</DialogTitle>
              <DialogDescription>
                Add someone who will be notified during emergencies
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newContact.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newContact.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 555-000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walletAddress">
                  Wallet Address (Optional)
                </Label>
                <Input
                  id="walletAddress"
                  name="walletAddress"
                  value={newContact.walletAddress}
                  onChange={handleInputChange}
                  placeholder="0x..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="emergency"
                  checked={newContact.isEmergencyContact}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="emergency">Emergency Contact</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact}>Add Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Take Photo</DialogTitle>
              <DialogDescription>
                Take a photo to send to {selectedContact?.name}
              </DialogDescription>
            </DialogHeader>
            <CameraComponent
              onPhotoCapture={handlePhotoCapture}
              selectedContact={selectedContact || undefined}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ContactsList;
