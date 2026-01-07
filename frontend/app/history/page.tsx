"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface CheckIn {
  id: string;
  task_id: string;
  status: string;
  date: string;
  created_at: string;
  pdf_url?: string;
  emp_id: string;
  employee_name?: string;
  employee_email?: string;
}

interface PaginationData {
  checkins: CheckIn[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function Reports() {
  const [user, setUser] = useState<User | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        
        if (userData.role === "employee") {
          router.push("/welcome");
          return;
        }

        if (userData.role !== "admin") {
          router.push("/login");
          return;
        }

        setUser(userData);

        // Fetch all check-ins for admin with pagination
        const response = await fetch(
          `http://localhost:8000/api/checkin/all-checkins?page=${currentPage}&page_size=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: PaginationData = await response.json();
          setCheckins(data.checkins || []);
          setTotalPages(data.total_pages || 1);
          setTotal(data.total || 0);
        } else if (response.status === 404) {
          // Endpoint doesn't exist yet, try alternative approach
          // For now, we'll show empty state
          setCheckins([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // If endpoint doesn't exist, show empty state
        setCheckins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, currentPage]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 font-noe-display">Reports</h1>
          <p className="text-gray-400">View all employee check-ins and their reports</p>
        </div>

        {checkins.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">No check-ins available yet</p>
            <p className="text-gray-500 mt-2">Check-ins will appear here once employees complete their daily check-ins</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="h-12 py-3 text-white/60 font-light text-sm uppercase tracking-wider">Name</TableHead>
                  <TableHead className="h-12 py-3 text-white/60 font-light text-sm uppercase tracking-wider">Email</TableHead>
                  <TableHead className="h-12 py-3 text-white/60 font-light text-sm uppercase tracking-wider">Check-in Date</TableHead>
                  <TableHead className="h-12 py-3 text-white/60 font-light text-sm uppercase tracking-wider text-right">PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkins.map((checkin) => (
                  <TableRow key={checkin.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="py-4 font-normal text-white/90">
                      {checkin.employee_name || `Employee ${checkin.emp_id}`}
                    </TableCell>
                    <TableCell className="py-4 text-white/70">
                      {checkin.employee_email || "-"}
                    </TableCell>
                    <TableCell className="py-4 text-white/80">
                      {formatDate(checkin.created_at || checkin.date)}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {checkin.pdf_url ? (
                        <button
                          onClick={() => {
                            const token = getToken();
                            window.open(
                              `http://localhost:8000/api/checkin/download-pdf/${checkin.id}?token=${token}`,
                              "_blank"
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors text-sm font-light"
                          title="Download PDF Report"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          PDF
                        </button>
                      ) : (
                        <span className="text-white/30 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {checkins.length > 0 && (
          <div className="mt-8">
            <div className="mb-6 text-sm text-white/50 text-center font-light">
              Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, total)} of {total} check-ins
            </div>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent className="w-full justify-center gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                      }}
                      className={`text-white/70 hover:text-white border-white/10 hover:border-white/30 bg-transparent hover:bg-white/5 ${currentPage === 1 ? "pointer-events-none opacity-30" : ""}`}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                          className={`${
                            currentPage === pageNum 
                              ? "bg-white/10 text-white border-white/20" 
                              : "text-white/60 hover:text-white border-white/10 hover:border-white/20 bg-transparent hover:bg-white/5"
                          }`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis className="text-white/40" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(totalPages);
                          }}
                          className="text-white/60 hover:text-white border-white/10 hover:border-white/20 bg-transparent hover:bg-white/5"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      }}
                      className={`text-white/70 hover:text-white border-white/10 hover:border-white/30 bg-transparent hover:bg-white/5 ${currentPage === totalPages ? "pointer-events-none opacity-30" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
