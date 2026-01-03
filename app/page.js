"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Send, Calendar, AlertTriangle, Building2, LayoutDashboard, Plus, Trash2, History, Pencil, Save, RotateCcw, FileJson, ChevronLeft, ChevronRight, Download, Upload, HardDriveDownload } from 'lucide-react';

export default function ProSalesReport() {
  // --- 1. State Configuration ---
  const [lineToken, setLineToken] = useState('');
  const [targetId, setTargetId] = useState('');
  
  const [companyName, setCompanyName] = useState(''); 
  const [date, setDate] = useState(''); 
  
  const [historyList, setHistoryList] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // File Import Ref
  const fileInputRef = useRef(null);

  // Group 1: Rent A Coat
  const [group1, setGroup1] = useState([
    { id: 1, name: 'Facebook', count: 0, color: '#1877F2', short: 'F' }, 
    { id: 2, name: 'Instagram', count: 0, color: '#E1306C', short: 'I' }, 
    { id: 3, name: 'TikTok', count: 0, color: '#000000', short: 'T' },   
    { id: 4, name: 'LINE OA', count: 0, color: '#06C755', short: 'L' },  
  ]);

  // Group 2: GO Mall
  const [group2, setGroup2] = useState([
    { id: 101, name: 'Facebook', count: 0, color: '#1877F2', short: 'F' }, 
    { id: 102, name: 'Instagram', count: 0, color: '#E1306C', short: 'I' }, 
    { id: 103, name: 'TikTok', count: 0, color: '#000000', short: 'T' },    
    { id: 104, name: 'LINE OA', count: 0, color: '#06C755', short: 'L' },  
  ]);

  const [status, setStatus] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // --- 2. Auto-Save & Load System ---
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    setDate(todayStr); 
    
    const savedData = localStorage.getItem('lineReportData_V2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if(parsed.lineToken) setLineToken(parsed.lineToken);
        if(parsed.targetId) setTargetId(parsed.targetId);
        if(parsed.companyName) setCompanyName(parsed.companyName);
        if(parsed.historyList && Array.isArray(parsed.historyList)) {
            setHistoryList(parsed.historyList);
        }
      } catch (e) { console.error("Load Error:", e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { lineToken, targetId, companyName, historyList };
      localStorage.setItem('lineReportData_V2', JSON.stringify(dataToSave));
    }
  }, [lineToken, targetId, companyName, historyList, isLoaded]);

  // --- 3. Backup & Restore System ---
  const handleExportData = () => {
      const dataToSave = {
          version: "V19",
          exportDate: new Date().toISOString(),
          lineToken,
          targetId,
          companyName,
          historyList
      };
      
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SalesReport_Backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleImportTrigger = () => {
      fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const importedData = JSON.parse(event.target.result);
              
              if(!window.confirm(`พบข้อมูลสำรองจากวันที่ ${importedData.exportDate || 'ไม่ระบุ'}\nจำนวนประวัติ: ${importedData.historyList?.length || 0} รายการ\n\nต้องการ "แทนที่" ข้อมูลปัจจุบันทั้งหมดใช่หรือไม่?`)) {
                  e.target.value = null; // Reset input
                  return;
              }

              if(importedData.lineToken) setLineToken(importedData.lineToken);
              if(importedData.targetId) setTargetId(importedData.targetId);
              if(importedData.companyName) setCompanyName(importedData.companyName);
              if(Array.isArray(importedData.historyList)) setHistoryList(importedData.historyList);

              alert("กู้คืนข้อมูลเรียบร้อยแล้ว!");
          } catch (error) {
              alert("ไฟล์ไม่ถูกต้อง หรือรูปแบบไฟล์เสียหาย");
              console.error(error);
          }
      };
      reader.readAsText(file);
      e.target.value = null; 
  };


  // --- 4. Helpers (Fixed Year Display & Auto Correct) ---
  
  // V19: ฟังก์ชันจัดการการเปลี่ยนวันที่ แบบฉลาด (Smart Date Handler)
  const handleSmartDateChange = (e) => {
      let val = e.target.value;
      if (!val) {
          setDate('');
          return;
      }

      // ตรวจสอบว่าปีมันเยอะผิดปกติไหม (เช่น ใส่ 2569 มาตรงๆ)
      const parts = val.split('-');
      if (parts.length === 3) {
          let year = parseInt(parts[0]);
          // ถ้าปีมากกว่า 2400 แสดงว่าผู้ใช้พิมพ์ พ.ศ. ใส่เข้ามา -> แปลงเป็น ค.ศ. ให้
          if (year > 2400) {
              year = year - 543;
              val = `${year}-${parts[1]}-${parts[2]}`;
          }
      }
      setDate(val);
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString + 'T00:00:00'); 
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch (e) { return dateString; }
  };

  const getBuddhistYear = (dateString) => {
      if(!dateString) return '';
      try {
          const year = parseInt(dateString.slice(0, 4));
          if(isNaN(year)) return '';
          // ถ้าปีน้อยกว่า 2400 ให้บวก 543 (เพราะเป็น ค.ศ.)
          // แต่ถ้าปีมันเยอะอยู่แล้ว (User Hack) ก็โชว์เลย
          const beYear = year < 2400 ? year + 543 : year;
          return `(พ.ศ. ${beYear})`;
      } catch(e) { return ''; }
  }

  const isPastDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    return date !== today;
  };

  const isWeekend = (dateStr) => {
    try {
        const d = new Date(dateStr + 'T00:00:00');
        const day = d.getDay(); 
        return day === 0 || day === 6; 
    } catch (e) { return false; }
  };

  // --- 5. Handlers ---
  const addHistoryRow = () => {
    setHistoryList(prev => [...prev, {
        id: Date.now(),
        date: '', 
        rac_fb: 0, rac_ig: 0, rac_tt: 0, rac_line: 0,
        gm_fb: 0, gm_ig: 0, gm_tt: 0, gm_line: 0,
    }]);
    setCurrentPage(1); 
  };

  const removeHistoryRow = (id) => {
    if(!window.confirm('ต้องการลบรายการนี้ใช่ไหม?')) return;
    setHistoryList(prev => prev.filter(item => item.id !== id));
  };

  // V19 Fix: ใช้ Smart Date Change กับ History Row ด้วย
  const updateHistoryDate = (id, rawValue) => {
      let val = rawValue;
      if (val) {
          const parts = val.split('-');
          if (parts.length === 3) {
              let year = parseInt(parts[0]);
              if (year > 2400) {
                  year = year - 543;
                  val = `${year}-${parts[1]}-${parts[2]}`;
              }
          }
      }
      setHistoryList(prev => prev.map(item => item.id === id ? { ...item, date: val } : item));
  };

  const updateHistoryRow = (id, field, value) => {
    setHistoryList(prev => prev.map(item => {
        if (item.id === id) return { ...item, [field]: value };
        return item;
    }));
  };

  const loadHistoryToForm = (item) => {
    if(!window.confirm(`ดึงข้อมูลวันที่ ${formatThaiDate(item.date)} มาแก้ไข? \n(รายการเดิมในประวัติจะถูกลบออกชั่วคราว จนกว่าคุณจะกดบันทึกใหม่)`)) return;
    setDate(item.date); 
    const mapToForm = (group, prefix) => group.map((p, i) => {
        const keys = ['fb', 'ig', 'tt', 'line'];
        const val = item[`${prefix}_${keys[i]}`];
        return { ...p, count: val === undefined ? 0 : val };
    });
    setGroup1(mapToForm(group1, 'rac'));
    setGroup2(mapToForm(group2, 'gm'));
    setHistoryList(prev => prev.filter(i => i.id !== item.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveTodayToHistory = () => {
      if(!date) return alert('กรุณาเลือกวันที่');
      const existingIndex = historyList.findIndex(h => h.date === date);
      if(existingIndex !== -1 && !window.confirm(`มีข้อมูลวันที่ ${formatThaiDate(date)} อยู่แล้ว ทับข้อมูลเดิมหรือไม่?`)) return;

      const newEntry = {
        id: existingIndex !== -1 ? historyList[existingIndex].id : Date.now(),
        date: date,
        rac_fb: group1[0].count, rac_ig: group1[1].count, rac_tt: group1[2].count, rac_line: group1[3].count,
        gm_fb: group2[0].count, gm_ig: group2[1].count, gm_tt: group2[2].count, gm_line: group2[3].count,
      };

      setHistoryList(prev => {
          let newList = [...prev];
          if(existingIndex !== -1) newList[existingIndex] = newEntry;
          else newList.push(newEntry);
          return newList;
      });
      alert(`บันทึกเรียบร้อย!`);
  };

  const resetForm = () => {
      if(!window.confirm('ต้องการล้างข้อมูลในฟอร์มเป็น 0 ทั้งหมดหรือไม่?')) return;
      setGroup1(prev => prev.map(p => ({...p, count: 0})));
      setGroup2(prev => prev.map(p => ({...p, count: 0})));
      setDate(new Date().toISOString().slice(0, 10));
  };

  const handleInputChange = (setter, id, value) => {
    setter(prev => prev.map(p => p.id === id ? { ...p, count: value } : p));
  };

  // --- 6. Calculation ---
  const accData = useMemo(() => {
    if (!date) return { rac: {total:0}, gm: {total:0}, fullList: [], todayRac: 0, todayGm: 0, perPlatform: [] };

    const currentDayFormatted = formatThaiDate(date);
    const selectedMonth = date.slice(0, 7); 

    const validHistory = historyList.filter(row => {
        return row.date !== date && row.date && row.date.startsWith(selectedMonth);
    });

    let acc = [0, 0, 0, 0, 0, 0, 0, 0]; 

    validHistory.forEach(row => {
        acc[0] += Number(row.rac_fb || 0); acc[1] += Number(row.rac_ig || 0);
        acc[2] += Number(row.rac_tt || 0); acc[3] += Number(row.rac_line || 0);
        acc[4] += Number(row.gm_fb || 0);  acc[5] += Number(row.gm_ig || 0);
        acc[6] += Number(row.gm_tt || 0);  acc[7] += Number(row.gm_line || 0);
    });

    acc[0] += Number(group1[0].count || 0); acc[1] += Number(group1[1].count || 0);
    acc[2] += Number(group1[2].count || 0); acc[3] += Number(group1[3].count || 0);
    acc[4] += Number(group2[0].count || 0); acc[5] += Number(group2[1].count || 0);
    acc[6] += Number(group2[2].count || 0); acc[7] += Number(group2[3].count || 0);

    const historyForTable = validHistory.map(row => {
        const racTotal = Number(row.rac_fb || 0)+Number(row.rac_ig || 0)+Number(row.rac_tt || 0)+Number(row.rac_line || 0);
        const gmTotal = Number(row.gm_fb || 0)+Number(row.gm_ig || 0)+Number(row.gm_tt || 0)+Number(row.gm_line || 0);
        return {
            date: formatThaiDate(row.date),
            racTotal,
            gmTotal,
            total: racTotal + gmTotal,
            isToday: false,
            sortDate: row.date,
            raw: row
        };
    });

    const todayRacTotal = group1.reduce((a,b)=>a+Number(b.count || 0),0);
    const todayGmTotal = group2.reduce((a,b)=>a+Number(b.count || 0),0);
    const todayRaw = {
        rac_fb: group1[0].count, rac_ig: group1[1].count, rac_tt: group1[2].count, rac_line: group1[3].count,
        gm_fb: group2[0].count, gm_ig: group2[1].count, gm_tt: group2[2].count, gm_line: group2[3].count,
      };

    historyForTable.push({
        date: currentDayFormatted,
        racTotal: todayRacTotal,
        gmTotal: todayGmTotal,
        total: todayRacTotal + todayGmTotal,
        isToday: true,
        sortDate: date,
        raw: todayRaw
    });

    historyForTable.sort((a, b) => a.sortDate.localeCompare(b.sortDate));

    return {
        rac: { total: acc[0]+acc[1]+acc[2]+acc[3] },
        gm: { total: acc[4]+acc[5]+acc[6]+acc[7] },
        fullList: historyForTable,
        todayRac: todayRacTotal,
        todayGm: todayGmTotal,
        perPlatform: acc
    };
  }, [date, historyList, group1, group2]);

  // --- Pagination & Sorting (Standard Sort) ---
  const sortedHistoryForDisplay = useMemo(() => {
      return [...historyList].sort((a,b) => {
          if (!a.date) return -1;
          if (!b.date) return 1;
          return new Date(b.date) - new Date(a.date);
      });
  }, [historyList]);

  const totalPages = Math.ceil(sortedHistoryForDisplay.length / itemsPerPage);
  const displayedHistory = sortedHistoryForDisplay.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // --- 7. Flex Message Generator ---
  const generateFlex = () => {
    const thaiDate = formatThaiDate(date);
    const grandTotalAcc = accData.rac.total + accData.gm.total;
    const racAcc = accData.rac.total;
    const gmAcc = accData.gm.total;
    const todayRac = accData.todayRac;
    const todayGm = accData.todayGm;
    const grandTotalDaily = todayRac + todayGm;

    const buildSmartBreakdown = (fb, ig, tt, line) => {
        let parts = [];
        if(Number(fb) > 0) parts.push(`F${fb}`);
        if(Number(ig) > 0) parts.push(`I${ig}`);
        if(Number(tt) > 0) parts.push(`T${tt}`);
        if(Number(line) > 0) parts.push(`L${line}`);
        return parts.length > 0 ? parts.join(' ') : "-";
    };

    const headerColor = "#C0392B"; 

    const createHeaderWithSummary = (title) => {
        return {
            type: "box", layout: "vertical", backgroundColor: headerColor, paddingAll: "20px",
            contents: [
                { 
                    type: "box", layout: "horizontal", 
                    contents: [
                        { type: "text", text: isPastDate() ? "⚠️ RETROACTIVE" : "DAILY REPORT", color: "#ffffffcc", weight: "bold", size: "xxs", flex: 1 },
                        { type: "text", text: `🗓 ${thaiDate}`, color: "#ffffff", size: "sm", align: "end", weight: "bold", flex: 0 }
                    ]
                },
                { type: "text", text: title, color: "#ffffff", weight: "bold", size: "lg", margin: "sm" },
                { type: "text", text: companyName || " ", color: "#ffffffaa", size: "xs", margin: "none" },
            ]
        };
    };

    const createDailyRows = (items, offset, groupTotalMtd) => items.map((p, i) => {
        const mtdVal = Number(accData.perPlatform[offset + i]) || 0;
        const safeGroupTotal = Number(groupTotalMtd) || 0;
        const percent = safeGroupTotal > 0 ? Math.round((mtdVal / safeGroupTotal) * 100) : 0;
        
        return {
            type: "box", layout: "horizontal", spacing: "sm", margin: "sm",
            contents: [
                { 
                    type: "box", layout: "horizontal", flex: 4, spacing: "sm", alignItems: "center", 
                    contents: [
                        { type: "box", layout: "vertical", width: "3px", height: "12px", backgroundColor: p.color, cornerRadius: "sm", contents: [] }, 
                        { type: "text", text: p.name, size: "xs", color: "#555555", weight: "regular" } 
                    ] 
                },
                { 
                    type: "text", 
                    text: `${mtdVal.toLocaleString()} (${percent}%)`, 
                    size: "xxs", color: "#aaaaaa", align: "end", flex: 3, gravity: "center" 
                }, 
                { 
                    type: "text", 
                    text: Number(p.count || 0).toLocaleString(), 
                    size: "xs", color: "#111111", weight: "bold", align: "end", flex: 2 
                }
            ]
        };
    });

    const dailyBubble = {
      type: "bubble", size: "giga",
      header: createHeaderWithSummary("รายงานทักแชทลูกค้าใหม่"),
      hero: {
          type: "box", layout: "vertical", paddingAll: "20px", backgroundColor: "#ffffff",
          contents: [
             {
                 type: "box", layout: "horizontal", spacing: "md",
                 contents: [
                     { 
                         type: "box", layout: "vertical", backgroundColor: "#F0F9FF", cornerRadius: "md", paddingAll: "16px", flex: 1, 
                         contents: [
                             { type: "text", text: "วันนี้ (Daily)", color: "#3B82F6", size: "xxs", weight: "bold" }, 
                             { type: "text", text: grandTotalDaily.toLocaleString(), color: "#1E3A8A", size: "xxl", weight: "bold", margin: "sm" },
                             { type: "text", text: `RAC: ${todayRac.toLocaleString()}`, color: "#64748B", size: "xxs", margin: "xs" },
                             { type: "text", text: `GM: ${todayGm.toLocaleString()}`, color: "#64748B", size: "xxs" }
                         ] 
                     },
                     { 
                         type: "box", layout: "vertical", backgroundColor: "#F0FDF4", cornerRadius: "md", paddingAll: "16px", flex: 1, 
                         contents: [
                             { type: "text", text: "สะสม (MTD)", color: "#22C55E", size: "xxs", weight: "bold" }, 
                             { type: "text", text: grandTotalAcc.toLocaleString(), color: "#14532D", size: "xxl", weight: "bold", margin: "sm" },
                             { type: "text", text: `RAC: ${racAcc.toLocaleString()}`, color: "#64748B", size: "xxs", margin: "xs" },
                             { type: "text", text: `GM: ${gmAcc.toLocaleString()}`, color: "#64748B", size: "xxs" }
                         ] 
                     }
                 ]
             }
          ]
      },
      body: {
          type: "box", layout: "vertical", paddingAll: "20px", backgroundColor: "#ffffff",
          contents: [
            {
                type: "box", layout: "horizontal", margin: "none",
                contents: [
                    { type: "text", text: "CH", size: "xxs", color: "#bbbbbb", weight: "bold", flex: 4 },
                    { type: "text", text: "MTD (%)", size: "xxs", color: "#bbbbbb", weight: "bold", align: "end", flex: 3 },
                    { type: "text", text: "DAILY", size: "xxs", color: "#bbbbbb", weight: "bold", align: "end", flex: 2 }
                ]
            },
            { type: "separator", margin: "md", color: "#F3F4F6" },
            { 
                type: "box", layout: "horizontal", margin: "lg", alignItems: "center", 
                contents: [
                    { type: "text", text: "RENT A COAT", color: "#111827", weight: "bold", size: "sm", flex: 1 }, 
                    { type: "text", text: `วันนี้: ${todayRac.toLocaleString()}`, color: "#6B7280", size: "xs", align: "end" }
                ] 
            },
            { type: "box", layout: "vertical", margin: "sm", contents: createDailyRows(group1, 0, racAcc) },
            { type: "separator", margin: "xl", color: "#F3F4F6" },
            { 
                type: "box", layout: "horizontal", margin: "lg", alignItems: "center", 
                contents: [
                    { type: "text", text: "GO MALL", color: "#111827", weight: "bold", size: "sm", flex: 1 }, 
                    { type: "text", text: `วันนี้: ${todayGm.toLocaleString()}`, color: "#6B7280", size: "xs", align: "end" }
                ] 
            },
            { 
                type: "box", layout: "vertical", margin: "xxl", alignItems: "center",
                contents: [
                     { type: "text", text: "👉 ปัดซ้ายเพื่อดูตารางสรุปรายเดือน", size: "xxs", color: "#9CA3AF" }
                ]
            }
          ]
      }
    };

    const ITEMS_PER_PAGE = 10;
    const monthlyBubbles = [];
    const totalPages = Math.ceil(accData.fullList.length / ITEMS_PER_PAGE);
    const loopCount = totalPages > 0 ? totalPages : 1;

    for (let i = 0; i < loopCount; i++) {
        const startIdx = i * ITEMS_PER_PAGE;
        const pageItems = accData.fullList.slice(startIdx, startIdx + ITEMS_PER_PAGE);
        
        const monthlyRows = pageItems.length > 0 ? pageItems.map((row, idx) => {
            const isEven = idx % 2 === 0;
            const isToday = row.isToday;
            const isWE = isWeekend(row.sortDate);
            
            let bg;
            if (isToday) bg = "#FEF3C7"; 
            else if (isWE) bg = "#FCE7F3"; 
            else bg = isEven ? "#ffffff" : "#f8fafc";
            
            const r = row.raw;
            const racDetail = buildSmartBreakdown(r.rac_fb, r.rac_ig, r.rac_tt, r.rac_line);
            const gmDetail = buildSmartBreakdown(r.gm_fb, r.gm_ig, r.gm_tt, r.gm_line);

            return {
                type: "box", layout: "vertical", paddingAll: "8px", backgroundColor: bg,
                contents: [
                    {
                        type: "box", layout: "horizontal",
                        contents: [
                            { type: "text", text: row.date, size: "xs", color: isToday ? "#D97706" : (isWE ? "#DB2777" : "#334155"), weight: (isToday || isWE) ? "bold" : "regular", flex: 2 },
                            { type: "text", text: row.racTotal.toLocaleString(), size: "xs", color: "#64748B", align: "end", flex: 1 },
                            { type: "text", text: row.gmTotal.toLocaleString(), size: "xs", color: "#64748B", align: "end", flex: 1 },
                            { type: "text", text: row.total.toLocaleString(), size: "xs", color: isToday ? "#D97706" : (isWE ? "#DB2777" : "#0F172A"), weight: "bold", align: "end", flex: 1 }
                        ]
                    },
                    { 
                        type: "text", 
                        text: `R:[${racDetail}] G:[${gmDetail}]`, 
                        size: "xxs", color: "#94a3b8", wrap: true, margin: "xs" 
                    }
                ]
            };
        }) : [{ type: "text", text: "ไม่มีข้อมูล", size: "xs", color: "#cbd5e1", align: "center" }];

        const pageBubble = {
            type: "bubble", size: "giga",
            body: {
                type: "box", layout: "vertical", paddingAll: "10px",
                contents: [
                    { type: "text", text: `MONTHLY TABLE (${i+1}/${loopCount})`, weight: "bold", color: "#334155", size: "sm", margin: "sm" },
                    { type: "separator", margin: "md" },
                    {
                        type: "box", layout: "horizontal", paddingAll: "8px", backgroundColor: "#E2E8F0", cornerRadius: "md", margin: "sm",
                        contents: [
                            { type: "text", text: "DATE", size: "xxs", color: "#475569", weight: "bold", flex: 2 },
                            { type: "text", text: "RAC", size: "xxs", color: "#475569", weight: "bold", align: "end", flex: 1 },
                            { type: "text", text: "GM", size: "xxs", color: "#475569", weight: "bold", align: "end", flex: 1 },
                            { type: "text", text: "TOTAL", size: "xxs", color: "#475569", weight: "bold", align: "end", flex: 1 }
                        ]
                    },
                    { type: "box", layout: "vertical", margin: "xs", contents: monthlyRows }
                ]
            }
        };
        monthlyBubbles.push(pageBubble);
    }

    return {
        type: "flex",
        altText: `รายงานยอดขายวันที่ ${thaiDate}`,
        contents: { type: "carousel", contents: [dailyBubble, ...monthlyBubbles] }
    };
  };

  const handleSend = async () => {
    if (!lineToken || !targetId) return alert('กรุณากรอก Token และ User ID');
    if(isPastDate() && !window.confirm(`⚠️ ยืนยันส่งรายงานย้อนหลังวันที่ "${formatThaiDate(date)}"?`)) return;
    
    setStatus('Sending...');
    try {
      const messages = [generateFlex()];
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: lineToken, to: targetId, messages }),
      });
      
      const data = await res.json();
      if (res.ok) {
          setStatus('Success! ส่งเรียบร้อย');
      } else {
          console.error("API Error:", data);
          setStatus(`Error! ${data.error || 'ส่งไม่ผ่าน Check Console'}`);
      }
    } catch (e) {
      console.error("Fetch Error - Likely No Backend", e);
      console.log("--- MOCK SEND PAYLOAD ---");
      console.log(JSON.stringify(generateFlex(), null, 2));
      setStatus('Error! (ตรวจสอบ Console เพื่อดู JSON)');
    }
  };

  const handleLogJson = () => {
    console.log("--- FLEX MESSAGE JSON ---");
    console.log(JSON.stringify(generateFlex(), null, 2));
    alert("ส่ง JSON ไปที่ Console แล้ว (กด F12 เพื่อดู)");
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center font-sans text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl p-6 space-y-6 border border-slate-200">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
               <LayoutDashboard className="text-blue-600"/> Pro Sales Report <span className="text-xs text-gray-400 font-normal">v19 (Smart Year)</span>
            </h1>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] md:text-xs px-3 py-1 rounded-full font-bold border ${isPastDate() ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                    {isPastDate() ? 'Retroactive Mode' : 'Live Mode'}
                </span>
                
                {/* Backup Controls */}
                <div className="flex gap-1 ml-2 pl-2 border-l border-slate-200">
                    <button onClick={handleExportData} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all" title="Backup Data (Download)">
                        <HardDriveDownload size={18}/>
                    </button>
                    <button onClick={handleImportTrigger} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-all" title="Restore Data (Upload)">
                        <Upload size={18}/>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="hidden" />
                </div>
            </div>
        </div>
        
        {/* Config */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 shadow-inner">
            <input type="password" placeholder="Channel Access Token" className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={lineToken} onChange={e => setLineToken(e.target.value)} />
            <input type="text" placeholder="Target ID (User/Group)" className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={targetId} onChange={e => setTargetId(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1"><Building2 size={16}/> ชื่อบริษัท</label>
                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น Brandname Market" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1"><Calendar size={16}/> วันที่รายงาน <span className="text-xs font-normal text-slate-400">{getBuddhistYear(date)}</span></label>
                
                {/* V19 Fix: ใช้ handleSmartDateChange แทน setDate */}
                <input type="date" className={`w-full p-2.5 border rounded-md outline-none ${isPastDate() ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}`} value={date} onChange={handleSmartDateChange} />
            </div>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                     <h3 className="font-bold text-slate-700 flex items-center gap-2"><LayoutDashboard size={18}/> ยอดขายประจำวันที่เลือก (Daily)</h3>
                     <div className="flex gap-2">
                         <button onClick={resetForm} className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-300 flex items-center gap-1 shadow-sm transition-colors">
                            <RotateCcw size={14}/> รีเซ็ต
                        </button>
                         <button onClick={saveTodayToHistory} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1 shadow-sm transition-colors">
                            <Save size={14}/> บันทึก
                        </button>
                     </div>
                </div>
                
                {/* Group 1 Input */}
                <div className="space-y-2 border p-3 rounded-lg border-blue-100 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        <div className="font-bold text-blue-800">Rent A Coat</div>
                    </div>
                    {group1.map(p => (
                        <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-8 text-sm text-slate-600 pl-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div>
                                {p.name}
                            </div>
                            <input 
                                type="number" 
                                placeholder="0" 
                                value={p.count === 0 ? '' : p.count} 
                                onChange={e => handleInputChange(setGroup1, p.id, e.target.value)} 
                                className="col-span-4 p-1.5 border border-slate-200 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    ))}
                </div>

                {/* Group 2 Input */}
                <div className="space-y-2 border p-3 rounded-lg border-orange-100 bg-orange-50/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                        <div className="font-bold text-orange-800">GO Mall</div>
                    </div>
                    {group2.map(p => (
                        <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-8 text-sm text-slate-600 pl-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div>
                                {p.name}
                            </div>
                            <input 
                                type="number" 
                                placeholder="0" 
                                value={p.count === 0 ? '' : p.count} 
                                onChange={e => handleInputChange(setGroup2, p.id, e.target.value)} 
                                className="col-span-4 p-1.5 border border-slate-200 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> ข้อมูลย้อนหลัง ({historyList.length})</h3>
                    <button onClick={addHistoryRow} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 flex items-center gap-1 transition-colors">
                        <Plus size={14}/> เพิ่มวัน (Manual)
                    </button>
                </div>
                
                {historyList.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm bg-slate-50">
                        ยังไม่มีประวัติที่บันทึกไว้ <br/>ระบบจะจำข้อมูลไว้ในเครื่องนี้ (Local Storage)
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                         {/* Pagination Controls */}
                         <div className="flex items-center justify-between bg-slate-100 p-2 rounded-t-lg border-b border-slate-200 text-xs text-slate-500">
                             <span>หน้า {currentPage} จาก {totalPages || 1}</span>
                             <div className="flex gap-2">
                                 <button 
                                    onClick={goToPrevPage} 
                                    disabled={currentPage === 1}
                                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                                 >
                                     <ChevronLeft size={16}/>
                                 </button>
                                 <button 
                                    onClick={goToNextPage} 
                                    disabled={currentPage >= totalPages}
                                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                                 >
                                     <ChevronRight size={16}/>
                                 </button>
                             </div>
                         </div>
                        
                         {/* Display List (Showing only 5 items) */}
                        <div className="space-y-3 p-2 bg-slate-50/50 border border-t-0 border-slate-200 rounded-b-lg min-h-[400px]">
                            {displayedHistory.map((row, index) => ( 
                                <div key={row.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative group hover:border-blue-300 transition-colors animate-fadeIn">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => loadHistoryToForm(row)} className="text-slate-400 hover:text-blue-500 transition-colors p-1" title="ดึงข้อมูลไปแก้ไข">
                                            <Pencil size={14}/>
                                        </button>
                                        <button onClick={() => removeHistoryRow(row.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="ลบ">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                    
                                    <div className="mb-3 pr-16">
                                        <label className="text-xs font-bold text-slate-500 block mb-1">วันที่ของข้อมูล <span className="font-normal text-slate-400">{getBuddhistYear(row.date)}</span></label>
                                        {/* V19 Fix: ใช้ updateHistoryDate แทน input ปกติ */}
                                        <input type="date" className="w-full p-1.5 border rounded text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-200 outline-none" value={row.date} onChange={(e) => updateHistoryDate(row.id, e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-blue-600 mb-1">RENT A COAT</div>
                                            <div className="grid grid-cols-4 gap-1">
                                                <div><label className="text-[9px] text-slate-400 block text-center">FB</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.rac_fb} onChange={(e) => updateHistoryRow(row.id, 'rac_fb', e.target.value)} /></div>
                                                <div><label className="text-[9px] text-slate-400 block text-center">IG</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.rac_ig} onChange={(e) => updateHistoryRow(row.id, 'rac_ig', e.target.value)} /></div>
                                                <div><label className="text-[9px] text-slate-400 block text-center">TT</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.rac_tt} onChange={(e) => updateHistoryRow(row.id, 'rac_tt', e.target.value)} /></div>
                                                <div><label className="text-[9px] text-slate-400 block text-center">LN</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.rac_line} onChange={(e) => updateHistoryRow(row.id, 'rac_line', e.target.value)} /></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-orange-600 mb-1">GO MALL</div>
                                            <div className="grid grid-cols-4 gap-1">
                                                <div><label className="text-[9px] text-slate-400 block text-center">FB</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.gm_fb} onChange={(e) => updateHistoryRow(row.id, 'gm_fb', e.target.value)} /></div>
                                                <div><label className="text-[9px] text-slate-400 block text-center">IG</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.gm_ig} onChange={(e) => updateHistoryRow(row.id, 'gm_ig', e.target.value)} /></div>
                                                <div><label className="text-[9px] text-slate-400 block text-center">TT</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.gm_tt} onChange={(e) => updateHistoryRow(row.id, 'gm_tt', e.target.value)} /></div>
                                                <div><label className="text-[9px] text-slate-400 block text-center">LN</label><input type="number" className="w-full border rounded p-1 text-xs text-center" value={row.gm_line} onChange={(e) => updateHistoryRow(row.id, 'gm_line', e.target.value)} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
             <button 
                onClick={handleLogJson}
                className="col-span-1 md:col-span-1 py-3 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
                <FileJson size={18}/> Debug JSON
            </button>
            <button 
                onClick={handleSend} 
                className={`col-span-1 md:col-span-3 py-3 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-white
                ${isPastDate() ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}
            >
                {status === 'Sending...' ? 'กำลังส่งรายงาน...' : (
                    isPastDate() ? <><AlertTriangle size={20}/> ยืนยันส่งรายงานย้อนหลัง</> : <><Send size={20}/> สร้างและส่งรายงาน</>
                )}
            </button>
        </div>
        
        {status && (
            <div className={`mt-3 text-center text-sm p-2 rounded-md font-medium ${status.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status}
            </div>
        )}

      </div>
    </div>
  );
}
