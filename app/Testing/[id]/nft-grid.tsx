import { Card, CardContent, CardFooter } from "@/components/ui";

// This would normally come from your API/Database
const nfts = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  name: `Bored Ape #${i + 1}`,
  price: (Math.random() * 100).toFixed(2),
  image: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png`,
}));

export function NFTGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {nfts.map((nft) => (
        <Card key={nft.id} className="overflow-hidden">
          <CardContent className="p-0">
            <img
              src={
                nft.image ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png"
              }
              alt={nft.name}
              className="aspect-square w-full object-cover"
            />
          </CardContent>
          <CardFooter className="p-4">
            <div>
              <h3 className="font-medium">{nft.name}</h3>
              <p className="text-sm text-muted-foreground">{nft.price} ETH</p>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
