"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { api } from "@/lib/apiClient";
import type { JobPosition } from "@/types";

import type { PositionCategory, ResumeIntent } from "./types";

export function useOpenPositions() {
  const router = useRouter();
  const resumeStorageKey = "resumeInterview";
  const positionsPerPage = 6;

  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [resumeIntent, setResumeIntent] = useState<ResumeIntent | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchPositions = async () => {
      try {
        const response = await api.get("/positions/");
        const data = response.data.results || response.data;
        if (!cancelled) {
          setPositions(data);
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPositions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(resumeStorageKey);
    if (!raw) return;

    try {
      const payload = JSON.parse(raw) as ResumeIntent;
      if (payload?.interviewId) {
        setResumeIntent({ interviewId: payload.interviewId, position: payload.position });
      }
    } catch {
      sessionStorage.removeItem(resumeStorageKey);
    }
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          positions
            .filter((position) => position.category_detail)
            .map((position) => [position.category_detail?.id, position.category_detail]),
        ).values(),
      ).filter((category): category is PositionCategory => Boolean(category)),
    [positions],
  );

  const filteredPositions = useMemo(() => {
    const keywordValue = keyword.trim().toLowerCase();
    const locationValue = locationFilter.trim().toLowerCase();

    return positions.filter((position) => {
      const text = `${position.name} ${position.description || ""}`.toLowerCase();
      if (keywordValue && !text.includes(keywordValue)) {
        return false;
      }
      if (categoryFilter !== "all" && position.category_detail?.id?.toString() !== categoryFilter) {
        return false;
      }
      if (locationValue) {
        const offices = position.offices_detail || [];
        if (offices.length === 0) {
          if (!"remote".includes(locationValue)) {
            return false;
          }
        } else {
          const matchesOffice = offices.some((office) => office.name.toLowerCase().includes(locationValue));
          if (!matchesOffice) {
            return false;
          }
        }
      }
      return true;
    });
  }, [positions, keyword, categoryFilter, locationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPositions.length / positionsPerPage));

  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * positionsPerPage;
    return filteredPositions.slice(start, start + positionsPerPage);
  }, [filteredPositions, currentPage, positionsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, categoryFilter, locationFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setFocusedIndex(null);
  }, [keyword, categoryFilter, locationFilter, currentPage]);

  useEffect(() => {
    if (focusedIndex === null) return;
    const target = cardRefs.current[focusedIndex];
    target?.focus();
  }, [focusedIndex, paginatedPositions]);

  useEffect(() => {
    if (selectedPosition) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (paginatedPositions.length === 0) return;

      event.preventDefault();
      setFocusedIndex((prev) => {
        const lastIndex = paginatedPositions.length - 1;
        if (event.key === "ArrowDown") {
          return prev === null ? 0 : Math.min(lastIndex, prev + 1);
        }
        return prev === null ? lastIndex : Math.max(0, prev - 1);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginatedPositions, selectedPosition]);

  const handleApply = (position: JobPosition) => {
    const offices = position.offices_detail || [];
    if (offices.length === 0) {
      router.push(`/register?position=${position.code}&office=null`);
    } else if (offices.length === 1) {
      router.push(`/register?position=${position.code}&office=${offices[0].id}`);
    } else {
      router.push(`/select-office?position=${position.code}`);
    }
  };

  const handleOpenPosition = (position: JobPosition, index: number) => {
    setFocusedIndex(index);
    cardRefs.current[index]?.focus();
    setSelectedPosition(position);
  };

  const handleCloseModal = () => {
    setSelectedPosition(null);
  };

  const handleResumeInterview = () => {
    if (!resumeIntent) return;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(resumeStorageKey);
    }
    router.push(`/interview/${resumeIntent.interviewId}`);
  };

  const setCardRef = (index: number, element: HTMLDivElement | null) => {
    cardRefs.current[index] = element;
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return {
    loading,
    keyword,
    categoryFilter,
    locationFilter,
    resumeIntent,
    selectedPosition,
    filteredPositions,
    paginatedPositions,
    totalPages,
    currentPage,
    focusedIndex,
    categories,
    setKeyword,
    setCategoryFilter,
    setLocationFilter,
    setFocusedIndex,
    handleApply,
    handleCloseModal,
    handleOpenPosition,
    handleResumeInterview,
    setCardRef,
    goToPreviousPage,
    goToNextPage,
  };
}
