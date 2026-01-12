import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <UploadForm 
        successRoute="/success"
        headerTitle="Submit Your Project"
        headerSubtitle="Upload photos and get a fast, accurate assessment"
      />
    </div>
  );
}
