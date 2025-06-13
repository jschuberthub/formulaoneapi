import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { format } from 'date-fns';

const endpoints = [
  { label: 'Drivers', key: 'drivers', url: 'http://localhost:8000/api/drivers' },
  { label: 'Meetings', key: 'meetings', url: 'http://localhost:8000/api/meetings' },
  { label: 'Sessions', key: 'sessions', url: 'http://localhost:8000/api/sessions' },
  { label: 'Team Radios', key: 'team-radio', url: 'http://localhost:8000/api/team-radio' },
  { label: 'Weather', key: 'weather', url: 'http://localhost:8000/api/weather' },
];

const FormulaOneData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('drivers');
  const [data, setData] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const endpoint = endpoints.find((e) => e.key === activeTab);
    if (!endpoint) return;
    fetch(endpoint.url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
        setData((prev) => ({ ...prev, [activeTab]: items }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    const items = data[activeTab] || [];
    if (!items.length) return [];
    let exclude = ['country_code', 'meeting_key', 'session_key', 'created_at', 'updated_at', 'broadcast_name', 'id', 'team_colour'];
    if (activeTab === 'meetings') {
      exclude = exclude.concat(['circuit_key', 'country_key', 'datestart', 'gmt_offset']);
    }
    if (activeTab === 'sessions') {
      exclude = exclude.concat(['gmt_offset', 'country_key', 'circuit_key']);
    }
    return Object.keys(items[0] as Record<string, unknown>)
      .filter((col) => !exclude.includes(col))
      .map((col) => ({
        accessorKey: col,
        header: () =>
          col.toLowerCase().includes('headshot')
            ? 'Picture'
            : col === 'country_name'
              ? 'Country'
              : col
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase()),
        cell: (info) => {
          if (col.toLowerCase().includes('headshot')) {
            const url = String(info.getValue() ?? '');
            if (!url) return null;
            return (
              <img
                src={url}
                alt={col}
                className="w-12 h-12 object-cover rounded-md border"
                style={{ minWidth: 32, minHeight: 32 }}
              />
            );
          }
          if (col.toLowerCase().includes('recording')) {
            const url = String(info.getValue() ?? '');
            if (!url) return null;
            // Check if it's a valid audio URL (simple check)
            if (/\.(mp3|wav|ogg)$/i.test(url)) {
              return (
                <audio controls className="w-48 max-w-full">
                  <source src={url} />
                  Your browser does not support the audio element.
                </audio>
              );
            }
            return <span className="font-mono text-xs break-all">{url}</span>;
          }
          // Check both col and info.column.id for date columns
          const colId = info.column.id?.toLowerCase() || '';
          if (col.toLowerCase().includes('date') || colId.includes('date')) {
            const value = info.getValue();
            if (!value) return '';
            const date = new Date(String(value));
            if (isNaN(date.getTime())) return String(value);
            try {
              return format(date, 'dd MMM yyyy, HH:mm');
            } catch {
              return date.toLocaleString();
            }
          }
          return String(info.getValue() ?? '');
        },
        enableColumnFilter: true,
        enableSorting: true,
        filterFn: 'includesString',
      }));
  }, [data, activeTab]);

  const table = useReactTable<Record<string, unknown>>({
    data: (data[activeTab] as Record<string, unknown>[]) || [],
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    debugTable: false,
  });

  return (
    <AppLayout breadcrumbs={[{ title: 'Formula One Data', href: '/formulaone' }]}>
      <Head title="Formula One Data" />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Formula One Data</h1>
        <div className="flex gap-2 mb-4">
          {endpoints.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black' : 'bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white'}`}
              onClick={() => {
                setActiveTab(tab.key);
                setGlobalFilter('');
                table.resetColumnFilters();
                table.resetSorting();
                table.setPageIndex(0);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Global Search */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border rounded px-3 py-2 min-w-[200px]"
          />
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const isIdCol = header.column.id === 'id';
                      return (
                        <th
                          key={header.id}
                          className={`border px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-left font-semibold min-w-[60px] ${isIdCol ? 'max-w-[60px] text-center' : 'max-w-[180px]'} truncate`}
                        >
                          <div className="flex flex-col gap-1">
                            <div className={`flex items-center gap-1 select-none ${isIdCol ? 'justify-center' : ''}`} onClick={header.column.getToggleSortingHandler()}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && (
                                <span className={
                                  `ml-1 transition-colors ` +
                                  (header.column.getIsSorted()
                                    ? 'text-black dark:text-neutral-100'
                                    : 'text-neutral-400')
                                }>
                                  {header.column.getIsSorted() === 'asc' && '▲'}
                                  {header.column.getIsSorted() === 'desc' && '▼'}
                                  {header.column.getIsSorted() === false && '▼'}
                                </span>
                              )}
                            </div>
                            {header.column.getCanFilter() && (
                              <input
                                type="text"
                                value={(header.column.getFilterValue() ?? '') as string}
                                onChange={e => header.column.setFilterValue(e.target.value)}
                                placeholder={`Filter...`}
                                className="border rounded px-2 py-1 text-xs"
                              />
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-muted-foreground text-center py-4">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-800'} hover:bg-neutral-100 dark:hover:bg-neutral-700`}
                    >
                      {row.getVisibleCells().map(cell => {
                        const isIdCol = cell.column.id === 'id';
                        const isDriverNumber = cell.column.id === 'driver_number';
                        const isRecording = cell.column.id.toLowerCase().includes('recording');
                        const isDate = cell.column.id.toLowerCase().includes('date') || cell.column.id.toLowerCase().includes('date_start') || cell.column.id.toLowerCase().includes('date_end');
                        return (
                          <td
                            key={cell.id}
                            className={`border px-3 py-2 align-top ${
                              isIdCol ? 'min-w-[60px] max-w-[60px] text-center' :
                              isDriverNumber ? 'min-w-[32px] max-w-[60px] text-center' :
                              isDate ? 'min-w-[80px] max-w-[120px] text-center' :
                              isRecording ? 'min-w-[400px] max-w-[800px]' :
                              'max-w-[180px]'
                            } truncate`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
              <div className="flex gap-2 items-center">
                <button
                  className="px-3 py-1 rounded border bg-neutral-100 dark:bg-neutral-800"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<<'}
                </button>
                <button
                  className="px-3 py-1 rounded border bg-neutral-100 dark:bg-neutral-800"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<'}
                </button>
                <button
                  className="px-3 py-1 rounded border bg-neutral-100 dark:bg-neutral-800"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {'>'}
                </button>
                <button
                  className="px-3 py-1 rounded border bg-neutral-100 dark:bg-neutral-800"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {'>>'}
                </button>
                <span className="ml-2">
                  Page{' '}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </strong>
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span>Go to page:</span>
                <input
                  type="number"
                  min={1}
                  max={table.getPageCount()}
                  value={table.getState().pagination.pageIndex + 1}
                  onChange={e => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0;
                    table.setPageIndex(page);
                  }}
                  className="border rounded px-2 py-1 w-16"
                />
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FormulaOneData;
