import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db, firebaseReady } from "../firebase";

function getMonthIndexFromName(monthName, year) {
  if (!monthName || !year) return null;
  const parsed = new Date(`${monthName} 1, ${year}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getMonth();
}

export default function usePaginatedTransactions(
  user,
  selectedYear,
  selectedMonth,
  initialPageSize = 10,
) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageCursors, setPageCursors] = useState([null]);

  const monthIndex = useMemo(
    () => getMonthIndexFromName(selectedMonth, selectedYear),
    [selectedMonth, selectedYear],
  );

  useEffect(() => {
    setPage(1);
    setHasPrevPage(false);
    setHasNextPage(false);
    setPageCursors([null]);
    setLastVisible(null);
  }, [user?.uid, selectedYear, selectedMonth, pageSize]);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  const getBaseQuery = useCallback(() => {
    if (!db || !user?.uid || !selectedYear || monthIndex === null) {
      return null;
    }

    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("year", "==", Number(selectedYear)),
      where("monthIndex", "==", Number(monthIndex)),
      orderBy("date", "desc"),
    );
  }, [monthIndex, selectedYear, user?.uid]);

  const ensureCursorForPage = useCallback(
    async (targetPage) => {
      if (targetPage <= 1) return null;

      const baseQuery = getBaseQuery();
      if (!baseQuery) return null;

      let cursors = [...pageCursors];

      // Build missing cursors incrementally up to the target page.
      for (let pageNumber = 2; pageNumber <= targetPage; pageNumber += 1) {
        const cursorIndex = pageNumber - 1;
        if (cursors[cursorIndex] !== undefined) continue;

        const prevCursor = cursors[cursorIndex - 1] || null;
        const q = prevCursor
          ? query(baseQuery, startAfter(prevCursor), limit(pageSize))
          : query(baseQuery, limit(pageSize));
        const snap = await getDocs(q);

        const docForNextCursor = snap.docs[snap.docs.length - 1] || null;
        cursors[cursorIndex] = docForNextCursor;

        if (snap.empty) break;
      }

      setPageCursors(cursors);
      return cursors[targetPage - 1] || null;
    },
    [getBaseQuery, pageCursors, pageSize],
  );

  const fetchPage = useCallback(async () => {
    if (
      !firebaseReady ||
      !db ||
      !user?.uid ||
      !selectedYear ||
      monthIndex === null
    ) {
      setTransactions([]);
      setTotalCount(0);
      setHasNextPage(false);
      setHasPrevPage(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const baseQuery = getBaseQuery();
      if (!baseQuery) {
        setTransactions([]);
        setTotalCount(0);
        setHasNextPage(false);
        setHasPrevPage(false);
        return;
      }

      const cursor = pageCursors[page - 1] || null;
      const pageQuery = cursor
        ? query(baseQuery, startAfter(cursor), limit(pageSize))
        : query(baseQuery, limit(pageSize));

      const snapshot = await getDocs(pageQuery);
      const docs = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastVisible(newLastVisible);
      setTransactions(docs);

      const hasPrev = page > 1;
      setHasPrevPage(hasPrev);

      if (newLastVisible) {
        const probeQuery = query(
          baseQuery,
          startAfter(newLastVisible),
          limit(1),
        );
        const probeSnap = await getDocs(probeQuery);
        setHasNextPage(!probeSnap.empty);
      } else {
        setHasNextPage(false);
      }

      const countSnap = await getCountFromServer(baseQuery);
      setTotalCount(countSnap.data().count || 0);
    } catch (fetchError) {
      console.error("Failed to fetch paginated transactions:", fetchError);
      setTransactions([]);
      setError(fetchError.message || "Failed to load transactions.");
      setHasNextPage(false);
      setHasPrevPage(page > 1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    getBaseQuery,
    monthIndex,
    page,
    pageCursors,
    pageSize,
    selectedYear,
    user?.uid,
  ]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function nextPage() {
    if (!hasNextPage || loading) return;

    setPageCursors((current) => {
      const next = [...current];
      next[page] = lastVisible || null;
      return next;
    });
    setPage((current) => current + 1);
  }

  function prevPage() {
    if (page <= 1 || loading) return;
    setPage((current) => Math.max(1, current - 1));
  }

  async function goToPage(targetPage) {
    if (loading) return;

    const parsed = Number(targetPage);
    if (!Number.isFinite(parsed)) return;

    const clamped = Math.max(1, Math.min(Math.floor(parsed), totalPages));
    if (clamped === page) return;

    if (clamped < page) {
      setPage(clamped);
      return;
    }

    await ensureCursorForPage(clamped);
    setPage(clamped);
  }

  function updatePageSize(nextPageSize) {
    const parsed = Number(nextPageSize);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setPageSize(parsed);
    setPage(1);
    setPageCursors([null]);
  }

  return {
    transactions,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    totalCount,
    pageSize,
    setPageSize: updatePageSize,
    nextPage,
    prevPage,
    goToPage,
  };
}
