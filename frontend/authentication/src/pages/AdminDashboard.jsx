import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
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

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("documents");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "documents") {
        const data = await apiRequest("/api/admin/documents");
        setDocuments(data);
      } else {
        const data = await apiRequest("/api/admin/users");
        setUsers(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (id, status) => {
    try {
      setError("");
      await apiRequest(`/api/admin/documents/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSuccess(`Document status updated to ${status}`);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to update document status");
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
                Admin Dashboard
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
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("documents")}
                className={`${
                  activeTab === "documents"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users
              </button>
            </nav>
          </div>

          {activeTab === "documents" && (
            <Card>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>
                  View and manage all uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-600">Loading documents...</p>
                ) : documents.length === 0 ? (
                  <p className="text-gray-600">No documents found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {doc.user.full_name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doc.user.email}
                              </div>
                            </td>
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
                              {doc.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateDocumentStatus(doc.id, "approved")
                                    }
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateDocumentStatus(doc.id, "rejected")
                                    }
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-600">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-gray-600">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documents
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.full_name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user._count?.documents || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}



// import { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import { apiRequest } from "../lib/api";
// import { Button } from "../components/ui/Button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "../components/ui/Card";
// import { errorToast, successToast } from "../lib/toast";

// export function AdminDashboard() {
//   const { profile, signOut } = useAuth();
//   const navigate = useNavigate();
//   const [documents, setDocuments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("documents");
//   const [updatingDocId, setUpdatingDocId] = useState(null);
  
//   const isMountedRef = useRef(true);

//   // Memoized load function
//   const loadData = useCallback(async () => {
//     try {
//       setLoading(true);
//       if (activeTab === "documents") {
//         const data = await apiRequest("/api/admin/documents");
//         if (isMountedRef.current) {
//           setDocuments(data);
//         }
//       } else {
//         const data = await apiRequest("/api/admin/users");
//         if (isMountedRef.current) {
//           setUsers(data);
//         }
//       }
//     } catch (err) {
//       if (isMountedRef.current) {
//         errorToast(err.message || "Failed to load data");
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [activeTab]);

//   useEffect(() => {
//     loadData();

//     return () => {
//       isMountedRef.current = false;
//     };
//   }, [loadData]);

//   const updateDocumentStatus = async (id, status) => {
//     setUpdatingDocId(id);
//     try {
//       await apiRequest(`/api/admin/documents/${id}/status`, {
//         method: "PATCH",
//         body: JSON.stringify({ status }),
//       });
      
//       successToast(`Document ${status}`);
      
//       // Optimistically update UI
//       setDocuments(prev =>
//         prev.map(doc => (doc.id === id ? { ...doc, status } : doc))
//       );
//     } catch (err) {
//       errorToast(err.message || "Failed to update document status");
//       // Reload to restore correct state
//       loadData();
//     } finally {
//       if (isMountedRef.current) {
//         setUpdatingDocId(null);
//       }
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

//   const getRoleBadgeClass = (role) => {
//     return role === "admin"
//       ? "bg-purple-100 text-purple-800"
//       : "bg-gray-100 text-gray-800";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Admin Dashboard
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
//           <div className="mb-6 border-b border-gray-200">
//             <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//               <button
//                 onClick={() => setActiveTab("documents")}
//                 className={`${
//                   activeTab === "documents"
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//                 aria-current={activeTab === "documents" ? "page" : undefined}
//               >
//                 Documents
//               </button>
//               <button
//                 onClick={() => setActiveTab("users")}
//                 className={`${
//                   activeTab === "users"
//                     ? "border-blue-500 text-blue-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//                 aria-current={activeTab === "users" ? "page" : undefined}
//               >
//                 Users
//               </button>
//             </nav>
//           </div>

//           {activeTab === "documents" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>All Documents</CardTitle>
//                 <CardDescription>
//                   View and manage all uploaded documents
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {loading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     <p className="ml-3 text-gray-600">Loading documents...</p>
//                   </div>
//                 ) : documents.length === 0 ? (
//                   <div className="text-center py-8">
//                     <p className="text-gray-600">No documents found</p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             User
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             File Name
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Type
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Status
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Uploaded
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {documents.map((doc) => (
//                           <tr key={doc.id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm text-gray-900">
//                                 {doc.user?.full_name || "N/A"}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {doc.user?.email || "N/A"}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {doc.fileName}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {doc.fileType}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span
//                                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
//                                   doc.status
//                                 )}`}
//                               >
//                                 {doc.status}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {new Date(doc.uploadedAt).toLocaleDateString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                               <a
//                                 href={doc.fileUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 hover:text-blue-900"
//                               >
//                                 View
//                               </a>
//                               {doc.status === "pending" && (
//                                 <>
//                                   <button
//                                     onClick={() =>
//                                       updateDocumentStatus(doc.id, "approved")
//                                     }
//                                     disabled={updatingDocId === doc.id}
//                                     className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
//                                   >
//                                     {updatingDocId === doc.id ? "..." : "Approve"}
//                                   </button>
//                                   <button
//                                     onClick={() =>
//                                       updateDocumentStatus(doc.id, "rejected")
//                                     }
//                                     disabled={updatingDocId === doc.id}
//                                     className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
//                                   >
//                                     {updatingDocId === doc.id ? "..." : "Reject"}
//                                   </button>
//                                 </>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}

//           {activeTab === "users" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>All Users</CardTitle>
//                 <CardDescription>View all registered users</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {loading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     <p className="ml-3 text-gray-600">Loading users...</p>
//                   </div>
//                 ) : users.length === 0 ? (
//                   <div className="text-center py-8">
//                     <p className="text-gray-600">No users found</p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Name
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Email
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Role
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Documents
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Joined
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {users.map((user) => (
//                           <tr key={user.id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {user.full_name || "N/A"}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {user.email}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span
//                                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(
//                                   user.role
//                                 )}`}
//                               >
//                                 {user.role}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {user._count?.documents || 0}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {new Date(user.created_at).toLocaleString()}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }