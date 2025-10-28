import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, Users, Package, ClipboardList, Building2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ApplyToEmergencyPlanDialog } from "@/components/documents/ApplyToEmergencyPlanDialog";

export default async function DocumentDetailsPage({
  params,
}: {
  params: { orgId: string; documentId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has access to this organization
  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", params.orgId)
    .single();

  if (!membership) {
    redirect("/dashboard");
  }

  // Fetch document details
  const { data: document } = await supabase
    .from("document_uploads")
    .select("*")
    .eq("id", params.documentId)
    .eq("org_id", params.orgId)
    .single();

  if (!document) {
    redirect(`/${params.orgId}/documents`);
  }

  // Fetch extractions
  const { data: extractions } = await supabase
    .from("document_extractions")
    .select("*")
    .eq("document_id", params.documentId)
    .order("created_at", { ascending: false });

  // Parse extracted data from the document
  const extractedData = document.extracted_data as any || {};
  const contacts = extractedData.contacts || [];
  const procedures = extractedData.procedures || [];
  const equipment = extractedData.equipment || [];
  const facilityInfo = extractedData.facility_info || null;

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "processing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${params.orgId}/documents`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Documents
            </Link>
          </div>
        </div>

        {/* Document Header */}
        <div className="glass-panel p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{document.file_name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  <span className={`px-3 py-1 rounded-full border ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                  {document.document_type && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {document.document_type.replace(/_/g, " ")}
                    </span>
                  )}
                  {document.confidence_score && (
                    <span className="text-xs">
                      {(document.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Uploaded {new Date(document.created_at).toLocaleString()}
                </p>
                {document.processed_at && (
                  <p className="text-sm text-muted-foreground">
                    Processed {new Date(document.processed_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <ApplyToEmergencyPlanDialog
                documentId={document.id}
                orgId={params.orgId}
                hasContacts={contacts.length > 0}
                hasProcedures={procedures.length > 0}
                hasFacilityInfo={!!facilityInfo}
                hasEquipment={equipment.length > 0}
                contactsCount={contacts.length}
                proceduresCount={procedures.length}
                equipmentCount={equipment.length}
              />
            </div>
          </div>
        </div>

        {/* Processing Error */}
        {document.status === "failed" && document.processing_error && (
          <div className="glass-panel p-6 border-red-500/20 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-600 mb-1">Processing Failed</h3>
                <p className="text-sm text-red-600/80">{document.processing_error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Data Sections */}
        {document.status === "completed" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contacts */}
            {contacts.length > 0 && (
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Contacts</h2>
                    <p className="text-sm text-muted-foreground">{contacts.length} contacts found</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {contacts.map((contact: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gradient-to-br from-white/50 to-white/30 border border-gray-200/50"
                    >
                      <h3 className="font-semibold mb-1">{contact.name}</h3>
                      {contact.title && (
                        <p className="text-sm text-muted-foreground mb-2">{contact.title}</p>
                      )}
                      <div className="space-y-1 text-sm">
                        {contact.phone && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Phone:</span> {contact.phone}
                          </p>
                        )}
                        {contact.email && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Email:</span> {contact.email}
                          </p>
                        )}
                        {contact.role && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Role:</span> {contact.role}
                          </p>
                        )}
                        {contact.department && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Department:</span> {contact.department}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facility Information */}
            {facilityInfo && (
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Facility Information</h2>
                    <p className="text-sm text-muted-foreground">Building details</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {facilityInfo.facility_name && (
                    <div>
                      <span className="font-medium">Facility Name:</span>
                      <p className="text-muted-foreground mt-1">{facilityInfo.facility_name}</p>
                    </div>
                  )}
                  {facilityInfo.address && (
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-muted-foreground mt-1">{facilityInfo.address}</p>
                    </div>
                  )}
                  {facilityInfo.building_type && (
                    <div>
                      <span className="font-medium">Building Type:</span>
                      <p className="text-muted-foreground mt-1">{facilityInfo.building_type}</p>
                    </div>
                  )}
                  {facilityInfo.square_footage && (
                    <div>
                      <span className="font-medium">Square Footage:</span>
                      <p className="text-muted-foreground mt-1">
                        {facilityInfo.square_footage.toLocaleString()} sq ft
                      </p>
                    </div>
                  )}
                  {facilityInfo.number_of_floors && (
                    <div>
                      <span className="font-medium">Floors:</span>
                      <p className="text-muted-foreground mt-1">{facilityInfo.number_of_floors}</p>
                    </div>
                  )}
                  {facilityInfo.occupancy && (
                    <div>
                      <span className="font-medium">Occupancy:</span>
                      <p className="text-muted-foreground mt-1">{facilityInfo.occupancy} people</p>
                    </div>
                  )}
                  {facilityInfo.operating_hours && (
                    <div>
                      <span className="font-medium">Operating Hours:</span>
                      <p className="text-muted-foreground mt-1">{facilityInfo.operating_hours}</p>
                    </div>
                  )}
                  {facilityInfo.utilities && facilityInfo.utilities.length > 0 && (
                    <div>
                      <span className="font-medium">Utilities:</span>
                      <div className="mt-2 space-y-2">
                        {facilityInfo.utilities.map((utility: any, index: number) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-gradient-to-br from-white/50 to-white/30 border border-gray-200/50"
                          >
                            <p className="font-medium">{utility.type}</p>
                            {utility.provider && (
                              <p className="text-xs text-muted-foreground">Provider: {utility.provider}</p>
                            )}
                            {utility.phone && (
                              <p className="text-xs text-muted-foreground">Phone: {utility.phone}</p>
                            )}
                            {utility.account_number && (
                              <p className="text-xs text-muted-foreground">
                                Account: {utility.account_number}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Equipment */}
            {equipment.length > 0 && (
              <div className="glass-panel p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Equipment Inventory</h2>
                    <p className="text-sm text-muted-foreground">{equipment.length} items found</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gradient-to-br from-white/50 to-white/30 border border-gray-200/50"
                    >
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {item.category && <p>Category: {item.category}</p>}
                        {item.quantity && <p>Quantity: {item.quantity}</p>}
                        {item.location && <p>Location: {item.location}</p>}
                        {item.manufacturer && <p>Manufacturer: {item.manufacturer}</p>}
                        {item.model && <p>Model: {item.model}</p>}
                        {item.serial_number && <p>Serial: {item.serial_number}</p>}
                        {item.maintenance_schedule && (
                          <p className="text-xs mt-2 text-orange-600">
                            Maintenance: {item.maintenance_schedule}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Procedures */}
            {procedures.length > 0 && (
              <div className="glass-panel p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Procedures</h2>
                    <p className="text-sm text-muted-foreground">{procedures.length} procedures found</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {procedures.map((procedure: any, index: number) => (
                    <div
                      key={index}
                      className="p-6 rounded-lg bg-gradient-to-br from-white/50 to-white/30 border border-gray-200/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{procedure.title}</h3>
                          {procedure.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                              {procedure.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {procedure.steps && procedure.steps.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Steps:</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {procedure.steps.map((step: string, stepIndex: number) => (
                              <li key={stepIndex}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {procedure.responsible_party && (
                          <span>
                            <span className="font-medium">Responsible:</span> {procedure.responsible_party}
                          </span>
                        )}
                        {procedure.frequency && (
                          <span>
                            <span className="font-medium">Frequency:</span> {procedure.frequency}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data Extracted */}
        {document.status === "completed" &&
          contacts.length === 0 &&
          procedures.length === 0 &&
          equipment.length === 0 &&
          !facilityInfo && (
            <div className="glass-panel p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Extracted</h3>
              <p className="text-muted-foreground">
                No structured data could be extracted from this document. The document may not contain
                contacts, procedures, equipment, or facility information.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
