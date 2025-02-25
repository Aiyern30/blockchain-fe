import axios from "axios";

export async function uploadToPinata(file: File, fileName: string) {
  if (!file || !fileName) throw new Error("Missing file or fileName");

  const formData = new FormData();
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({ name: fileName });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}
