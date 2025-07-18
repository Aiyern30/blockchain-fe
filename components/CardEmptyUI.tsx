import Image from "next/image";
import { Button } from "@/components/ui/";
import { useRouter } from "next/navigation";

interface CardEmptyUIProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  type: "cart" | "wishlist" | "collection" | "profile";
  openConnectModal?: () => void;
}

const CardEmptyUI: React.FC<CardEmptyUIProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  type,
  openConnectModal,
}) => {
  const imageSrc =
    type === "cart"
      ? "/Cart.svg"
      : type === "wishlist"
      ? "/shopping-cart.svg"
      : type === "profile"
      ? "/connect-wallet.svg"
      : "/collection.svg";

  const router = useRouter();

  const navigationTo = () => {
    if (onButtonClick) {
      onButtonClick();
    }

    if (type === "profile" && openConnectModal) {
      openConnectModal();
      return;
    }

    if (type === "collection") {
      router.push("/Create/Collection");
    } else {
      router.push("/Explore");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <div className="relative w-[200px] h-[200px]">
        <Image
          src={imageSrc}
          alt="Empty State"
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button
        variant="default"
        onClick={() => {
          navigationTo();
        }}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default CardEmptyUI;
