import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { FileText, Upload } from "lucide-react";

export default async function DocumentsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch uploaded documents
  const { data: documents } = await supabase
    .from("document_uploads")
    .select("*")
    .eq("org_id", params.orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your emergency planning documents
        </p>
      </div>

      {/* Upload Section */}
      <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-glass backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/60 dark:from-gray-800/90 dark:to-gray-900/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
              <div className="relative rounded-lg bg-primary/10 p-2">
                <Upload className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle>Upload Document</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentUpload orgId={params.orgId} />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-glass backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/60 dark:from-gray-800/90 dark:to-gray-900/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
              <div className="relative rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle>Uploaded Documents</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                      <div className="relative rounded-full bg-primary/10 p-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          doc.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : doc.status === "processing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : doc.status === "failed"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {doc.status}
                        </span>
                        {doc.document_type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{doc.document_type.replace('_', ' ')}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                <div className="relative rounded-full bg-primary/10 p-6">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="mt-6 text-lg font-medium">No documents yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Upload your first document to get started with AI-powered data extraction
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
