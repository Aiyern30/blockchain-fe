import { CreateCollectionForm } from "./create-collection-form";

export default function CreateCollectionPage() {
  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Collection</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to create your NFT collection
        </p>
      </div>
      <CreateCollectionForm />
    </div>
  );
}
