// ✅ DataTable con input coerenti, dropdown relazionati e gestione campi utente
import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function DataTable({ titolo, endpoint, endpointBase, mappaRelazioni = {}, dropdowns = {} }) {
  const [dati, setDati] = useState([]);
  const [sortKeys, setSortKeys] = useState([]);
  const [perPagina, setPerPagina] = useState(20);
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [modalRecord, setModalRecord] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({});

  const isUserField = (col) => /user|username/i.test(col);

  useEffect(() => {
    setFilters({});
    setSortKeys([]);
    setSelected([]);
    setModalRecord(null);
  }, [endpoint]);

  useEffect(() => {
    axios.get(endpoint)
      .then(res => {
        const remapped = res.data.map(el => {
          const mapped = {};
          for (const [campo, attributo] of Object.entries(mappaRelazioni)) {
            if (el[campo]?.[attributo]) {
              mapped[`${campo}_${attributo}`] = el[campo][attributo];
            }
          }
          for (const [key, value] of Object.entries(el)) {
            if (typeof value !== 'object' || value === null) {
              mapped[key] = value;
            }
          }
          return mapped;
        });
        setDati(remapped);
        setVisibleColumns(Object.keys(remapped[0] || {}).filter(c => !c.toLowerCase().includes("id")));
      })
      .catch(err => toast.error("Errore caricamento dati"));

    for (const campo of Object.keys(dropdowns)) {
      axios.get(dropdowns[campo]).then(res => {
        setDropdownOptions(prev => ({ ...prev, [campo]: res.data }));
      });
    }
  }, [endpoint]);

const getColumnType = (col) => {
  const values = dati.map(row => row[col]).filter(v => v !== null && v !== undefined);

  if (values.every(v => typeof v === "boolean")) return "boolean";
  if (values.every(v => typeof v === "number" || (!isNaN(Number(v)) && typeof v === "string" && v.trim() !== ""))) return "number";
  if (values.every(v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}(T.*)?Z?$/.test(v))) return "date";

  return "text";
};

  const toggleSort = (colonna) => {
    setSortKeys(prev => {
      const existing = prev.find(s => s.key === colonna);
      if (!existing) return [...prev, { key: colonna, order: "asc" }];
      if (existing.order === "asc") return prev.map(s => s.key === colonna ? { ...s, order: "desc" } : s);
      return prev.filter(s => s.key !== colonna);
    });
  };

  const getSortedData = () => {
    let result = [...dati].filter(row => {
      return Object.entries(filters).every(([key, val]) => {
        if (key.endsWith("_min") || key.endsWith("_max")) {
          const baseKey = key.replace(/_(min|max)$/, "");
          const isMin = key.endsWith("_min");
          const cell = row[baseKey];
          if (cell === null || cell === undefined) return true;
          if (typeof cell === "string" && /^\d{4}-\d{2}-\d{2}(T.*)?Z?$/.test(cell)) {
            const cellDate = cell.split("T")[0];
            return isMin ? cellDate >= val : cellDate <= val;
          } else if (!isNaN(Number(cell)) && !isNaN(Number(val))) {
            const cellNum = Number(cell);
            const filterNum = Number(val);
            return isMin ? cellNum >= filterNum : cellNum <= filterNum;
          }
          return true;
        }
        return val === "" || String(row[key] ?? "").toLowerCase().includes(val.toLowerCase());
      });
    });
    for (let { key, order } of [...sortKeys].reverse()) {
      result.sort((a, b) => {
        const va = a[key] ?? "";
        const vb = b[key] ?? "";
        return order === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return result.slice(0, perPagina);
  };

  const resetSorting = () => setSortKeys([]);
  const resetFilters = () => setFilters({});

  const handleDelete = (id) => {
    if (!window.confirm("Confermi l'eliminazione?")) return;
    axios.delete(`${endpointBase}/${id}`)
      .then(() => {
        setDati(prev => prev.filter(item => item.id !== id));
        toast.success("Elemento eliminato");
      })
      .catch(err => toast.error("Errore durante l'eliminazione"));
  };

  const handleEdit = (record) => setModalRecord(record);

  const saveEdit = () => {
    if (!modalRecord?.id) return;
    axios.put(`${endpointBase}/${modalRecord.id}`, modalRecord)
      .then(() => {
        setDati(prev => prev.map(p => (p.id === modalRecord.id ? modalRecord : p)));
        setModalRecord(null);
        toast.success("Record aggiornato");
      })
      .catch(() => toast.error("Errore aggiornamento"));
  };

  const formatColName = (col) => {
    const cleaned = col.toLowerCase().includes("nome") ? col.replace(/nome/i, "").replace(/[_-]/g, " ").trim() : col;
    return cleaned.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());
  };

  const renderEditInput = (col, value) => {
    if (isUserField(col)) {
      return <input disabled readOnly value={value ?? ""} className="w-full bg-gray-700 text-white p-2 rounded opacity-50 cursor-not-allowed" />;
    }

    const type = getColumnType(col);

    if (dropdownOptions[col]) {
      return (
        <select
          className="w-full bg-gray-800 text-white p-2 rounded"
          value={value ?? ""}
          onChange={e => setModalRecord(prev => ({ ...prev, [col]: e.target.value }))}
        >
          <option value="">-- Seleziona --</option>
          {dropdownOptions[col].map(opt => (
            <option key={opt.id} value={opt.id}>{opt.nome || opt.fullname || opt.username || opt.id}</option>
          ))}
        </select>
      );
    }

    if (type === "boolean") {
      return (
        <select
          className="w-full bg-gray-800 text-white p-2 rounded"
          value={value ? "true" : "false"}
          onChange={e => setModalRecord(prev => ({ ...prev, [col]: e.target.value === "true" }))}
        >
          <option value="true">✅ Vero</option>
          <option value="false">❌ Falso</option>
        </select>
      );
    }
    if (type === "date") {
      return (
        <input
          type="date"
          className="w-full bg-gray-800 text-white p-2 rounded"
          value={value ? new Date(value).toISOString().split("T")[0] : ""}
          onChange={e => setModalRecord(prev => ({ ...prev, [col]: e.target.value }))}
        />
      );
    }
    if (type === "number") {
      return (
        <input
          type="number"
          className="w-full bg-gray-800 text-white p-2 rounded"
          value={value ?? ""}
          onChange={e => setModalRecord(prev => ({ ...prev, [col]: e.target.valueAsNumber }))}
        />
      );
    }
    return (
      <input
        type="text"
        className="w-full bg-gray-800 text-white p-2 rounded"
        value={value ?? ""}
        onChange={e => setModalRecord(prev => ({ ...prev, [col]: e.target.value }))}
      />
    );
  };

  return (
    <div className="p-6 text-white">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">{titolo}</h2>
      <div className="flex gap-4 mb-4">
        <button onClick={resetSorting} className="bg-gray-700 px-4 py-2 rounded">Reset Sort</button>
        <button onClick={resetFilters} className="bg-gray-700 px-4 py-2 rounded">Reset Filtri</button>
      </div>

      <table className="w-full border border-gray-700">
        <thead>
          <tr>
            <th className="sticky left-0 bg-gray-900 p-2 border-b border-gray-600">Azioni</th>
            {visibleColumns.map(col => (
              <th
                key={col}
                onClick={() => toggleSort(col)}
                className="p-2 border-b border-gray-600 cursor-pointer hover:bg-gray-800"
              >
                {formatColName(col)}
                {sortKeys.findIndex(s => s.key === col) !== -1 &&
                  ` (${sortKeys.findIndex(s => s.key === col) + 1}. ${sortKeys.find(s => s.key === col).order})`}
              </th>
            ))}
          </tr>
            <tr>
              <td className="sticky left-0 bg-gray-900 p-2 border-b border-gray-600 text-sm">Filtri</td>
              {visibleColumns.map(col => {
                const type = getColumnType(col);

                if (type === "number" || type === "date") {
                  return (
                    <td key={col} className="p-1 border-b border-gray-600">
                      <div className="flex gap-1">
                        <input
                          type={type}
                          value={filters[`${col}_min`] || ""}
                          className="w-1/2 bg-gray-800 text-white p-1 rounded text-xs"
                          placeholder="Min"
                          onChange={(e) => setFilters(prev => ({ ...prev, [`${col}_min`]: e.target.value }))}
                        />
                        <input
                          type={type}
                          value={filters[`${col}_max`] || ""}
                          className="w-1/2 bg-gray-800 text-white p-1 rounded text-xs"
                          placeholder="Max"
                          onChange={(e) => setFilters(prev => ({ ...prev, [`${col}_max`]: e.target.value }))}
                        />
                      </div>
                    </td>
                  );
                }

                return (
                  <td key={col} className="p-1 border-b border-gray-600">
                    <input
                      type="text"
                      value={filters[col] || ""}
                      className="w-full bg-gray-800 text-white p-1 rounded text-sm"
                      placeholder={`Filtra ${formatColName(col)}`}
                      onChange={(e) => setFilters(prev => ({ ...prev, [col]: e.target.value }))}
                    />
                  </td>
                );
              })}
            </tr>

        </thead>
        <tbody>
          {getSortedData().map((riga, idx) => (
            <tr key={idx} className="odd:bg-gray-800 even:bg-gray-900">
              <td className="sticky left-0 bg-gray-900 p-2 border-b border-gray-700">
                <button onClick={() => handleEdit(riga)} className="text-blue-400 hover:underline mr-2">Modifica</button>
                <button onClick={() => handleDelete(riga.id)} className="text-red-400 hover:underline">Elimina</button>
              </td>
              {visibleColumns.map(col => (
                <td key={col} className="p-2 border-b border-gray-700">
                  {isUserField(col)
                    ? "🔒"
                    : (() => {
                        const val = riga[col];
                        if (val === null || val === undefined) return "";
                        if (val === true) return "✅";
                        if (val === false) return "";
                        if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}(T.*)?Z?$/.test(val)) {
                          const dateOnly = val.split("T")[0]; // estrae solo '2025-06-07'
                          const [year, month, day] = dateOnly.split("-");
                          return `${day}/${month}/${year}`;
                        }
                        return typeof val === "object" ? JSON.stringify(val) : String(val);
                      })()
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {modalRecord && (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md z-50">
            <h3 className="text-xl font-semibold mb-4 text-white">Modifica Record</h3>
            {Object.entries(modalRecord)
              .filter(([key]) => !key.toLowerCase().includes("id"))
              .map(([col, value]) => (
                <div key={col} className="mb-3">
                  <label className="block text-sm mb-1 text-gray-300">{formatColName(col)}</label>
                  {renderEditInput(col, value)}
                </div>
              ))}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalRecord(null)} className="bg-gray-600 px-4 py-2 rounded">Annulla</button>
              <button onClick={saveEdit} className="bg-blue-600 px-4 py-2 rounded">Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
