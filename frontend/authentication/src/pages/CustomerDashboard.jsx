import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest, uploadFile } from "../lib/api";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";
import { errorToast, successToast } from "../lib/toast";

export function CustomerDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/documents/my-documents");
      setDocuments(data);
    } catch (err) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, PNG, and JPG files are allowed");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setUploading(true);
      await uploadFile("/api/documents/upload", file);
      setSuccess("Document uploaded successfully!");
      loadDocuments();
      e.target.value = ""; // Reset file input
    } catch (err) {
      setError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
      setSuccess("Document deleted successfully");
      loadDocuments();
    } catch (err) {
      setError(err.message || "Failed to delete document");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (err) {
      setError(err.message || "Failed to sign out");
    }
  };

  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      successToast(success);
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Dashboard
              </h1>
              <p className="text-sm text-gray-600">{profile?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload proof documents (PDF, PNG, or JPG - Max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploading && (
                  <p className="text-sm text-gray-600">Uploading...</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>
                View and manage your uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-gray-600">No documents uploaded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {doc.fileName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.fileType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doc.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : doc.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}



// import { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import { apiRequest, uploadFile } from "../lib/api";
// import { Button } from "../components/ui/Button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "../components/ui/Card";
// import { errorToast, successToast } from "../lib/toast";

// const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// export function CustomerDashboard() {
//   const { profile, signOut } = useAuth();
//   const navigate = useNavigate();
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef(null);
  
//   // Use ref to track mounted state
//   const isMountedRef = useRef(true);

//   // Memoized load function to prevent unnecessary recreations
//   const loadDocuments = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await apiRequest("/api/documents/my-documents");
      
//       // Only update state if component is still mounted
//       if (isMountedRef.current) {
//         setDocuments(data);
//       }
//     } catch (err) {
//       if (isMountedRef.current) {
//         errorToast(err.message || "Failed to load documents");
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setLoading(false);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     loadDocuments();

//     // Cleanup function
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, [loadDocuments]);

//   const validateFile = (file) => {
//     if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//       return "Only PDF, PNG, and JPG files are allowed";
//     }

//     if (file.size > MAX_FILE_SIZE) {
//       return "File size must be less than 10MB";
//     }

//     return null;
//   };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file
//     const validationError = validateFile(file);
//     if (validationError) {
//       errorToast(validationError);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//       return;
//     }

//     setUploading(true);
//     try {
//       await uploadFile("/api/documents/upload", file);
//       successToast("Document uploaded successfully!");
//       await loadDocuments();
      
//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch (err) {
//       errorToast(err.message || "Failed to upload document");
//     } finally {
//       if (isMountedRef.current) {
//         setUploading(false);
//       }
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this document?")) {
//       return;
//     }

//     try {
//       await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
//       successToast("Document deleted successfully");
      
//       // Optimistically update UI
//       setDocuments(prev => prev.filter(doc => doc.id !== id));
//     } catch (err) {
//       errorToast(err.message || "Failed to delete document");
//       // Reload to restore correct state
//       loadDocuments();
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut();
//       navigate("/auth/login");
//     } catch (err) {
//       errorToast(err.message || "Failed to sign out");
//     }
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case "approved":
//         return "bg-green-100 text-green-800";
//       case "rejected":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-yellow-100 text-yellow-800";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Customer Dashboard
//               </h1>
//               <p className="text-sm text-gray-600">{profile?.email}</p>
//             </div>
//             <Button onClick={handleLogout} variant="outline">
//               Sign Out
//             </Button>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="px-4 py-6 sm:px-0">
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle>Upload Document</CardTitle>
//               <CardDescription>
//                 Upload proof documents (PDF, PNG, or JPG - Max 10MB)
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center gap-4">
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".pdf,.png,.jpg,.jpeg"
//                   onChange={handleFileUpload}
//                   disabled={uploading}
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                 />
//                 {uploading && (
//                   <div className="flex items-center gap-2">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//                     <p className="text-sm text-gray-600">Uploading...</p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>My Documents</CardTitle>
//               <CardDescription>
//                 View and manage your uploaded documents
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   <p className="ml-3 text-gray-600">Loading documents...</p>
//                 </div>
//               ) : documents.length === 0 ? (
//                 <div className="text-center py-8">
//                   <p className="text-gray-600">No documents uploaded yet</p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Upload your first document using the form above
//                   </p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           File Name
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Type
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Uploaded
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {documents.map((doc) => (
//                         <tr key={doc.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {doc.fileName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {doc.fileType}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
//                                 doc.status
//                               )}`}
//                             >
//                               {doc.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {new Date(doc.uploadedAt).toLocaleDateString()}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                             <a
//                               href={doc.fileUrl}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 hover:text-blue-900"
//                             >
//                               View
//                             </a>
//                             <button
//                               onClick={() => handleDelete(doc.id)}
//                               className="text-red-600 hover:text-red-900"
//                               disabled={uploading}
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }