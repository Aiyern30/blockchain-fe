import { toast } from "sonner";

export const handleCopy = (walletAddress: string) => {
  if (walletAddress) {
    navigator.clipboard
      .writeText(walletAddress)
      .then(() => {
        toast.success("Copied wallet address to clipboard.", {
          style: {
            backgroundColor: "#16a34a", // green
            color: "white",
          },
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy wallet address.", {
          style: {
            backgroundColor: "#dc2626", // red
            color: "white",
          },
        });
      });
  }
};

export const handleShare = (walletAddress: string) => {
  if (walletAddress) {
    const profileUrl = `${window.location.origin}/Profile/${walletAddress}`;
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        toast.success("Profile link copied to clipboard.", {
          style: {
            backgroundColor: "#2563eb", // blue
            color: "white",
          },
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy profile link.", {
          style: {
            backgroundColor: "#dc2626", // red
            color: "white",
          },
        });
      });
  }
};
