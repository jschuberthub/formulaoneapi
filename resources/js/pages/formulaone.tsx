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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalInitial, setModalInitial] = useState<Record<string, unknown> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Record<string, unknown> | null>(null);
  type Meeting = { meeting_key: number | string; meeting_name?: string; meeting_official_name?: string; name?: string };
  const [meetingsList, setMeetingsList] = useState<Meeting[]>([]);

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

  // Fetch meetings for session and weather modal
  useEffect(() => {
    if (!modalOpen || (activeTab !== 'sessions' && activeTab !== 'weather')) return;
    fetch('http://localhost:8000/api/meetings')
      .then(res => res.json())
      .then(json => {
        const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
        setMeetingsList(items as Meeting[]);
      })
      .catch(() => setMeetingsList([]));
  }, [modalOpen, activeTab]);

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

  function isColumnWithAccessorKey(col: ColumnDef<Record<string, unknown>>): col is ColumnDef<Record<string, unknown>> & { accessorKey: string } {
    return typeof (col as unknown as { accessorKey?: unknown }).accessorKey === 'string';
  }
  const visibleColumns = columns
    .filter(isColumnWithAccessorKey)
    .map((col) => col.accessorKey);

  // Get API endpoint for current tab
  const currentEndpoint = endpoints.find((e) => e.key === activeTab)?.url;

  // Handle create/update
  const handleSubmit = async (form: Record<string, unknown>) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (!currentEndpoint) throw new Error('No endpoint defined');
      const isEdit = modalMode === 'edit';
      const id = form.id || modalInitial?.id;
      const url = isEdit ? `${currentEndpoint}/${id}` : currentEndpoint;
      const method = isEdit ? 'PUT' : 'POST';
      let body: Record<string, unknown> = {};
      if (activeTab === 'drivers') {
        body = {
          driver_number: form.driver_number ? parseInt(form.driver_number as string, 10) : undefined,
          first_name: form.first_name ?? '',
          last_name: form.last_name ?? '',
          full_name: form.full_name ?? (form.first_name && form.last_name ? `${form.first_name} ${form.last_name}` : ''),
          name_acronym: form.name_acronym ?? '',
          team_name: form.team_name ?? '',
          headshot_url: form.headshot_url ?? '',
        };
      } else if (activeTab === 'meetings') {
        body = {
          meeting_key: form.meeting_key ? parseInt(form.meeting_key as string, 10) : undefined,
          meeting_name: form.meeting_name ?? '',
          meeting_official_name: form.meeting_official_name ?? '',
          circuit_short_name: form.circuit_short_name ?? '',
          country_code: form.country_code ?? '',
          country_name: form.country_name ?? '',
          location: form.location ?? '',
          circuit_key: form.circuit_key ? parseInt(form.circuit_key as string, 10) : undefined,
          country_key: form.country_key ? parseInt(form.country_key as string, 10) : undefined,
          date_start: form.date_start ?? '',
          gmt_offset: form.gmt_offset ?? '',
          year: form.year ? parseInt(form.year as string, 10) : undefined,
        };
      } else if (activeTab === 'sessions') {
        // Find the selected meeting object
        const selectedMeeting: Meeting | undefined = meetingsList.find(m => String(m.meeting_key) === form.meeting_id);
        body = {
          session_id: form.session_id ? String(form.session_id) : undefined,
          session_name: form.session_name ?? '',
          session_type: form.session_type ?? '',
          meeting_id: selectedMeeting ? Number(selectedMeeting.meeting_key) : undefined,
          meeting_key: selectedMeeting ? Number(selectedMeeting.meeting_key) : undefined,
          session_key: form.session_key ?? form.session_id ?? '',
          circuit_key: form.circuit_key ? parseInt(form.circuit_key as string, 10) : undefined,
          circuit_short_name: form.circuit_short_name ?? '',
          country_code: form.country_code ?? '',
          country_key: form.country_key ? parseInt(form.country_key as string, 10) : undefined,
          country_name: form.country_name ?? '',
          location: form.location ?? '',
          date_start: form.date_start ?? '',
          date_end: form.date_end ?? '',
          gmt_offset: form.gmt_offset ?? '',
          year: form.year ? parseInt(form.year as string, 10) : undefined,
        };
        console.log('Submitting session with meeting_id:', body.meeting_id, 'meeting_key:', body.meeting_key, 'Full body:', body);
      } else if (activeTab === 'team-radio') {
        body = {
          team_radio_id: form.team_radio_id ? parseInt(form.team_radio_id as string, 10) : undefined,
          meeting_key: form.meeting_key ? parseInt(form.meeting_key as string, 10) : undefined,
          meeting_id: form.meeting_key ? parseInt(form.meeting_key as string, 10) : undefined,
          session_key: form.session_key ?? '',
          driver_number: form.driver_number ? parseInt(form.driver_number as string, 10) : undefined,
          date: form.date ? new Date(form.date as string).toISOString() : undefined,
          recording_url: form.recording_url ?? '',
        };
      } else if (activeTab === 'weather') {
        body = {
          weather_id: form.weather_id ? parseInt(form.weather_id as string, 10) : undefined,
          meeting_key: form.meeting_key ? parseInt(form.meeting_key as string, 10) : undefined,
          session_key: form.session_key ?? '',
          date: form.time ? new Date(form.time as string).toISOString() : undefined,
          air_temperature: form.air_temperature ? parseFloat(form.air_temperature as string) : undefined,
          humidity: form.humidity ? parseFloat(form.humidity as string) : undefined,
          pressure: form.pressure ? parseFloat(form.pressure as string) : undefined,
          rainfall: form.rainfall ? parseFloat(form.rainfall as string) : undefined,
          track_temperature: form.track_temperature ? parseFloat(form.track_temperature as string) : undefined,
          wind_direction: form.wind_direction ? parseFloat(form.wind_direction as string) : undefined,
          wind_speed: form.wind_speed ? parseFloat(form.wind_speed as string) : undefined,
        };
      } else {
        Object.entries(form).forEach(([k, v]) => {
          if (typeof v === 'string') body[k] = v;
        });
      }
      delete body.id;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let errorMsg = 'Failed to save';
        try {
          const errorJson = await res.json();
          if (errorJson && errorJson.errors) {
            errorMsg = Object.values(errorJson.errors).flat().join(' ');
          } else if (errorJson && errorJson.message) {
            errorMsg = errorJson.message;
          }
        } catch {
          // Ignore JSON parse errors, use default errorMsg
        }
        throw new Error(errorMsg);
      }
      setModalOpen(false);
      setModalInitial(null);
      setModalError(null);
      setLoading(true);
      fetch(currentEndpoint)
        .then((res) => res.json())
        .then((json) => {
          const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
          setData((prev) => ({ ...prev, [activeTab]: items }));
        })
        .finally(() => setLoading(false));
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = (row: Record<string, unknown>) => {
    setDeleteRow(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setLoading(true);
    try {
      if (!currentEndpoint) throw new Error('No endpoint defined');
      const url = `${currentEndpoint}/${deleteRow.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      // Refresh data
      fetch(currentEndpoint)
        .then((res) => res.json())
        .then((json) => {
          const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
          setData((prev) => ({ ...prev, [activeTab]: items }));
        })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeleteRow(null);
      alert('Delete failed');
      return;
    }
    setDeleteDialogOpen(false);
    setDeleteRow(null);
  };

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
        {/* Add Button */}
        <div className="mb-2 flex justify-end">
          <Button onClick={() => { setModalMode('create'); setModalInitial(null); setModalOpen(true); }}>
            + Add
          </Button>
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
                    <th className="border px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-left font-semibold min-w-[80px]">Actions</th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-muted-foreground text-center py-4">
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
                      {/* Actions */}
                      <td className="border px-3 py-2 align-top min-w-[80px]">
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => {
                          setModalMode('edit');
                          setModalInitial(row.original);
                          setModalOpen(true);
                        }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>Delete</Button>
                      </td>
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
        {/* Modal for Create/Update */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modalMode === 'create' ? `Add ${endpoints.find(e => e.key === activeTab)?.label}` : `Edit ${endpoints.find(e => e.key === activeTab)?.label}`}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={function (event) {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const form: Record<string, string> = {};
                for (const [k, v] of formData.entries()) {
                  if (typeof v === 'string') form[k] = v;
                }
                if (modalMode === 'edit' && !form.id && modalInitial?.id) form.id = String(modalInitial.id);
                handleSubmit(form);
              }}
              className="space-y-4"
            >
              {modalMode === 'edit' && (typeof modalInitial?.id === 'string' || typeof modalInitial?.id === 'number') && (
                <input type="hidden" name="id" value={String(modalInitial.id)} />
              )}
              {activeTab === 'meetings' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="meeting_key">Meeting Key<span className="text-red-500">*</span></label>
                    <input id="meeting_key" name="meeting_key" type="number" min={1} defaultValue={String(modalInitial?.meeting_key ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="meeting_name">Meeting Name<span className="text-red-500">*</span></label>
                    <input id="meeting_name" name="meeting_name" type="text" defaultValue={String(modalInitial?.meeting_name ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="meeting_official_name">Official Name</label>
                    <input id="meeting_official_name" name="meeting_official_name" type="text" defaultValue={String(modalInitial?.meeting_official_name ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="circuit_short_name">Circuit Short Name</label>
                    <input id="circuit_short_name" name="circuit_short_name" type="text" defaultValue={String(modalInitial?.circuit_short_name ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="country_code">Country Code<span className="text-red-500">*</span></label>
                    <input id="country_code" name="country_code" type="text" defaultValue={String(modalInitial?.country_code ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="country_name">Country Name<span className="text-red-500">*</span></label>
                    <input id="country_name" name="country_name" type="text" defaultValue={String(modalInitial?.country_name ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="location">Location</label>
                    <input id="location" name="location" type="text" defaultValue={String(modalInitial?.location ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="circuit_key">Circuit Key<span className="text-red-500">*</span></label>
                    <input id="circuit_key" name="circuit_key" type="number" min={1} defaultValue={String(modalInitial?.circuit_key ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="country_key">Country Key<span className="text-red-500">*</span></label>
                    <input id="country_key" name="country_key" type="number" min={1} defaultValue={String(modalInitial?.country_key ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="date_start">Date Start<span className="text-red-500">*</span></label>
                    <input id="date_start" name="date_start" type="datetime-local" defaultValue={String(modalInitial?.date_start ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="gmt_offset">GMT Offset</label>
                    <input id="gmt_offset" name="gmt_offset" type="text" defaultValue={String(modalInitial?.gmt_offset ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="year">Year<span className="text-red-500">*</span></label>
                    <input id="year" name="year" type="number" min={1900} max={2100} defaultValue={String(modalInitial?.year ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                </div>
              ) : activeTab === 'sessions' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="session_id">Session ID<span className="text-red-500">*</span></label>
                    <input id="session_id" name="session_id" type="text" defaultValue={String(modalInitial?.session_id ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="session_name">Session Name<span className="text-red-500">*</span></label>
                    <input id="session_name" name="session_name" type="text" defaultValue={String(modalInitial?.session_name ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="session_type">Session Type<span className="text-red-500">*</span></label>
                    <input id="session_type" name="session_type" type="text" defaultValue={String(modalInitial?.session_type ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="meeting_id">Meeting<span className="text-red-500">*</span></label>
                    <select
                      id="meeting_id"
                      name="meeting_id"
                      className="border rounded px-3 py-2 w-full"
                      defaultValue={String(modalInitial?.meeting_id ?? '')}
                      required
                    >
                      <option value="" disabled>Select a meeting</option>
                      {meetingsList.map(m => (
                        <option key={m.meeting_key} value={String(m.meeting_key)}>{m.meeting_name ?? m.meeting_official_name ?? m.name ?? m.meeting_key}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="circuit_key">Circuit Key<span className="text-red-500">*</span></label>
                    <input id="circuit_key" name="circuit_key" type="number" min={1} defaultValue={String(modalInitial?.circuit_key ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="circuit_short_name">Circuit Short Name<span className="text-red-500">*</span></label>
                    <input id="circuit_short_name" name="circuit_short_name" type="text" defaultValue={String(modalInitial?.circuit_short_name ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="country_code">Country Code<span className="text-red-500">*</span></label>
                    <input id="country_code" name="country_code" type="text" defaultValue={String(modalInitial?.country_code ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="country_key">Country Key<span className="text-red-500">*</span></label>
                    <input id="country_key" name="country_key" type="number" min={1} defaultValue={String(modalInitial?.country_key ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="country_name">Country Name<span className="text-red-500">*</span></label>
                    <input id="country_name" name="country_name" type="text" defaultValue={String(modalInitial?.country_name ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="location">Location<span className="text-red-500">*</span></label>
                    <input id="location" name="location" type="text" defaultValue={String(modalInitial?.location ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="date_start">Date Start<span className="text-red-500">*</span></label>
                    <input id="date_start" name="date_start" type="datetime-local" defaultValue={String(modalInitial?.date_start ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="date_end">Date End<span className="text-red-500">*</span></label>
                    <input id="date_end" name="date_end" type="datetime-local" defaultValue={String(modalInitial?.date_end ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="gmt_offset">GMT Offset</label>
                    <input id="gmt_offset" name="gmt_offset" type="text" defaultValue={String(modalInitial?.gmt_offset ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="year">Year<span className="text-red-500">*</span></label>
                    <input id="year" name="year" type="number" min={1900} max={2100} defaultValue={String(modalInitial?.year ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                </div>
              ) : activeTab === 'team-radio' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="team_radio_id">Team Radio ID<span className="text-red-500">*</span></label>
                    <input id="team_radio_id" name="team_radio_id" type="number" min={1} placeholder="e.g. 1001"
                      defaultValue={String(modalInitial?.team_radio_id ?? modalInitial?.id ?? '')}
                      className="border rounded px-3 py-2 w-full"
                      required
                      readOnly={modalMode === 'edit'}
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting_key">Meeting<span className="text-red-500">*</span></label>
                    <select
                      id="meeting_key"
                      name="meeting_key"
                      className="border rounded px-3 py-2 w-full"
                      defaultValue={String(modalInitial?.meeting_key ?? '')}
                      required
                    >
                      <option value="" disabled>Select a meeting</option>
                      {meetingsList.map(m => (
                        <option key={m.meeting_key} value={String(m.meeting_key)}>{m.meeting_name ?? m.meeting_official_name ?? m.name ?? m.meeting_key}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="session_key">Session Key</label>
                    <input id="session_key" name="session_key" type="text" placeholder="e.g. 1212" defaultValue={String(modalInitial?.session_key ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="driver_number">Driver Number</label>
                    <input id="driver_number" name="driver_number" type="number" placeholder="e.g. 44" defaultValue={String(modalInitial?.driver_number ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="date">Date<span className="text-red-500">*</span></label>
                    <input id="date" name="date" type="datetime-local" defaultValue={String(modalInitial?.date ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label htmlFor="recording_url">Recording URL<span className="text-red-500">*</span></label>
                    <input id="recording_url" name="recording_url" type="text" placeholder="e.g. https://..." defaultValue={String(modalInitial?.recording_url ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                </div>
              ) : activeTab === 'weather' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weather_id">Weather ID<span className="text-red-500">*</span></label>
                    <input id="weather_id" name="weather_id" type="number" min={1} placeholder="e.g. 1001"
                      defaultValue={String(modalInitial?.weather_id ?? modalInitial?.id ?? '')}
                      className="border rounded px-3 py-2 w-full"
                      required
                      readOnly={modalMode === 'edit'}
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting_key">Meeting<span className="text-red-500">*</span></label>
                    <select
                      id="meeting_key"
                      name="meeting_key"
                      className="border rounded px-3 py-2 w-full"
                      defaultValue={String(modalInitial?.meeting_key ?? '')}
                      required
                    >
                      <option value="" disabled>Select a meeting</option>
                      {meetingsList.map(m => (
                        <option key={m.meeting_key} value={String(m.meeting_key)}>{m.meeting_name ?? m.meeting_official_name ?? m.name ?? m.meeting_key}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="session_key">Session Key</label>
                    <input id="session_key" name="session_key" type="text" placeholder="e.g. 1212" defaultValue={String(modalInitial?.session_key ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="time">Date<span className="text-red-500">*</span></label>
                    <input id="time" name="time" type="datetime-local" defaultValue={String(modalInitial?.date ?? '')} className="border rounded px-3 py-2 w-full" required />
                  </div>
                  <div>
                    <label htmlFor="air_temperature">Air Temperature (°C)</label>
                    <input id="air_temperature" name="air_temperature" type="number" step="any" placeholder="e.g. 22.5" defaultValue={String(modalInitial?.air_temperature ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="humidity">Humidity (%)</label>
                    <input id="humidity" name="humidity" type="number" step="any" placeholder="e.g. 60" defaultValue={String(modalInitial?.humidity ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="pressure">Pressure (hPa)</label>
                    <input id="pressure" name="pressure" type="number" step="any" placeholder="e.g. 1013" defaultValue={String(modalInitial?.pressure ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input id="is_raining" name="is_raining" type="checkbox" className="mr-2" />
                    <label htmlFor="is_raining" className="mb-0">Is Raining?</label>
                  </div>
                  <div id="rainfall-group" style={{ display: 'none' }}>
                    <label htmlFor="rainfall">Rainfall (mm)</label>
                    <input id="rainfall" name="rainfall" type="number" step="any" placeholder="e.g. 2.5" defaultValue={String(modalInitial?.rainfall ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="track_temperature">Track Temperature (°C)</label>
                    <input id="track_temperature" name="track_temperature" type="number" step="any" placeholder="e.g. 30.0" defaultValue={String(modalInitial?.track_temperature ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label htmlFor="wind_direction">Wind Direction</label>
                    <div className="flex gap-2">
                      <select id="wind_direction_select" className="border rounded px-3 py-2 w-1/2">
                        <option value="">Select direction</option>
                        <option value="0">N</option>
                        <option value="45">NE</option>
                        <option value="90">E</option>
                        <option value="135">SE</option>
                        <option value="180">S</option>
                        <option value="225">SW</option>
                        <option value="270">W</option>
                        <option value="315">NW</option>
                      </select>
                      <input id="wind_direction" name="wind_direction" type="number" step="any" placeholder="Degrees (0-359)" defaultValue={String(modalInitial?.wind_direction ?? '')} className="border rounded px-3 py-2 w-1/2" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wind_speed">Wind Speed (km/h)</label>
                    <input id="wind_speed" name="wind_speed" type="number" step="any" placeholder="e.g. 15.2" defaultValue={String(modalInitial?.wind_speed ?? '')} className="border rounded px-3 py-2 w-full" />
                  </div>
                </div>
              ) : (
                visibleColumns.filter(col => [
                  'driver_number', 'first_name', 'last_name', 'full_name', 'name_acronym', 'team_name', 'headshot_url'
                ].includes(col)).map((col) => {
                  const isRequired = [
                    'driver_number', 'first_name', 'last_name', 'full_name', 'name_acronym', 'team_name'
                  ].includes(col);
                  const type = col === 'driver_number' ? 'number' : 'text';
                  return (
                    <div key={col}>
                      <label className="block text-sm font-medium mb-1 capitalize" htmlFor={col}>{col.replace(/_/g, ' ')}{isRequired ? <span className="text-red-500">*</span> : null}</label>
                      <input
                        id={col}
                        name={col}
                        type={type}
                        min={col === 'driver_number' ? 1 : undefined}
                        defaultValue={
                          modalInitial && modalInitial[col] !== undefined && modalInitial[col] !== null
                            ? String(modalInitial[col])
                            : ''
                        }
                        className="border rounded px-3 py-2 w-full"
                        required={isRequired}
                      />
                    </div>
                  );
                })
              )}
              {modalError && <div className="text-red-500 text-sm">{modalError}</div>}
              <DialogFooter>
                <Button type="submit" disabled={modalLoading}>{modalLoading ? 'Saving...' : 'Save'}</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Dialog for Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this entry?</p>
            <DialogFooter>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default FormulaOneData;
