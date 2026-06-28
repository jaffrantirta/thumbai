import { ThumbnailCreator } from "@/components/thumbnail/ThumbnailCreator";

export default function CreatePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">create thumbnail</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          fill in the details and let ai generate your thumbnail
        </p>
      </div>
      <ThumbnailCreator />
    </div>
  );
}
