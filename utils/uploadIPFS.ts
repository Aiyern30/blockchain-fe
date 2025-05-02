/* eslint-disable @typescript-eslint/no-explicit-any */
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    }
  );

  if (!response.ok) throw new Error("❌ File upload failed");
  const data = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

export const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) throw new Error("❌ Metadata upload failed");
  const data = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};
