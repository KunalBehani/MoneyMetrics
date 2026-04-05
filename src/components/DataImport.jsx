import { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js?url';
import { toast } from 'react-toastify';
import { FiUpload } from 'react-icons/fi';
import { useTransactions } from '../hooks/useTransactions';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const DataImport = () => {
  const fileInputRef = useRef(null);
  const { addTransaction } = useTransactions();
  const [isImporting, setIsImporting] = useState(false);

  const processParsedData = (data) => {
    let importedCount = 0;

    data.forEach(row => {
      // Normalize keys loosely to find Description, Amount, Date
      const keys = Object.keys(row);
      const descKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('title')) || keys[1];
      const amtKey = keys.find(k => k.toLowerCase().includes('amount') || k.toLowerCase().includes('rs') || k.toLowerCase().includes('value') || k.toLowerCase().includes('deb') || k.toLowerCase().includes('cred')) || keys[2];
      const dateKey = keys.find(k => k.toLowerCase().includes('date')) || keys[0];

      if (!descKey || !amtKey) return;

      const description = (row[descKey] || '').toString();
      const amountStr = String(row[amtKey]).replace(/[^0-9.-]+/g, "");
      const amountValue = Number(amountStr);
      
      if (isNaN(amountValue) || amountValue === 0) return;

      const lowerDesc = description.toLowerCase();

      // Type Detection
      let type = 'expense';
      if (lowerDesc.includes('credited')) {
        type = 'income';
      } else if (lowerDesc.includes('debited')) {
        type = 'expense';
      } else if (amountValue > 0 && keys.find(k => k.toLowerCase() === 'type' && row[k]?.toLowerCase().includes('income'))) {
         type = 'income';
      } else if (amountValue < 0) {
         type = 'expense';
      }

      // Smart Categorization
      let category = 'Other';
      if (type === 'expense') {
        if (/zomato|swiggy|starbucks|blinkit|zepto|food|restaurant|cafe|mcdonalds|kfc|pizza|burger|chai|eat|bakery|lunch|dinner|breakfast|canteen/i.test(lowerDesc)) category = 'Food';
        else if (/netflix|spotify|youtube|prime|apple|hotstar|sony|subscription|membership|disney|hulu/i.test(lowerDesc)) category = 'Subscriptions';
        else if (/uber|ola|petrol|rapido|irctc|fuel|airways|indigo|flight|train|bus|metro|booking|travel|taxi|cab|auto|rickshaw/i.test(lowerDesc)) category = 'Travel';
        else if (/amazon|flipkart|myntra|ajio|store|mall|supermarket|mart|reliance|shop|grocery|dmart|bigbasket|spencer|pantaloons|trends/i.test(lowerDesc)) category = 'Shopping';
        else if (/rent|pg|housing|maintenance|society|security|property/i.test(lowerDesc)) category = 'Rent';
        else if (/movie|pvr|inox|bookmyshow|ticket|fun|game|park|zoo|museum|club/i.test(lowerDesc)) category = 'Entertainment';
        else if (/hospital|clinic|pharmacy|apollo|medplus|medical|health|doctor|dentist|eye|lab|test|medicine/i.test(lowerDesc)) category = 'Health';
        else if (/bill|recharge|airtel|jio|vi|electricity|water|wifi|broadband|bescom|utility|gas|cylinder|tata sky|dish tv/i.test(lowerDesc)) category = 'Utilities';
        else if (/fees|school|college|uni|education|course|udemy|coursera|books/i.test(lowerDesc)) category = 'Education';
        else if (/insurance|lic|policy|hdfc life|sbi life/i.test(lowerDesc)) category = 'Insurance';
        else if (/loan|emi|interest|mortgage/i.test(lowerDesc)) category = 'EMI';
      } else {
         category = 'Salary';
         if (/refund|reversal|cashback|reward|cash back/.test(lowerDesc)) category = 'Other';
         else if (/dividend|interest|int\.?pd/i.test(lowerDesc)) category = 'Other';
      }

      // Parse date or use today
      let txnDate = new Date().toISOString().split('T')[0];
      if (row[dateKey]) {
        let rawDateStr = String(row[dateKey]).trim();
        let parsedDate = null;
        
        // Handle formats like 03-04-2026 or 03/04/2026
        if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(rawDateStr)) {
            let parts = rawDateStr.split(/[-/.]/);
            // Invert logic: check which one is likely year vs day
            if (parts[2].length === 4) {
                // Assuming DD-MM-YYYY
                parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else if (parts[0].length === 4) {
                // Assuming YYYY-MM-DD
                parsedDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
            }
        } 
        
        // Fallback or handle Month names like 03-Apr-2026
        if (!parsedDate || isNaN(parsedDate.getTime())) {
            parsedDate = new Date(rawDateStr);
        }
        
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          txnDate = parsedDate.toISOString().split('T')[0];
        }
      }

      addTransaction({
        title: description,
        amount: Math.abs(amountValue),
        date: txnDate,
        category,
        type,
        notes: 'Imported'
      });
      importedCount++;
    });

    if (importedCount > 0) {
      toast.success(`Successfully imported ${importedCount} transactions!`);
    } else {
      toast.warning('No valid transactions found in the file.');
    }

    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processPDFContent = async (sourceUrl) => {
    try {
      const loadingTask = pdfjsLib.getDocument(sourceUrl);
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const items = textContent.items.map(item => ({
              str: item.str,
              x: item.transform[4],
              y: item.transform[5]
          }));
          
          items.sort((a, b) => {
              if (Math.abs(a.y - b.y) > 5) {
                  return b.y - a.y; 
              }
              return a.x - b.x; 
          });
          
          let lastY = null;
          let line = '';
          items.forEach(item => {
              if (lastY === null) {
                  lastY = item.y;
                  line = item.str;
              } else if (Math.abs(item.y - lastY) > 5) {
                  fullText += line + '\n';
                  lastY = item.y;
                  line = item.str;
              } else {
                  line += ' ' + item.str;
              }
          });
          fullText += line + '\n';
      }
      
      const lines = fullText.split('\n');
      const parsedRows = [];
      let currentTxn = null;

      const finalizeTxn = (txn) => {
          if (!txn.amounts || txn.amounts.length < 1) return null;
          
          // Current Balance is ALWAYS the last number found in the transaction row
          const balance = txn.amounts[txn.amounts.length - 1]; 
          
          // All other positive numbers found on the line are potential transaction amounts
          // (Usually Withdrawal or Deposit columns)
          const candidates = txn.amounts.slice(0, -1).filter(a => a > 0);
          
          let description = txn.description.replace(/(?:Rs\.?|INR|₹|\$)?\s*[\d,]+\.\d{2}/ig, '')
                                           .replace(/\b(?:Cr|Dr|Credit|Debit)\b/ig, '')
                                           .replace(/\s+/g, ' ')
                                           .trim();
          
          return { dateStr: txn.dateStr, candidates, balance, description };
      };

      lines.forEach(line => {
          const dateMatch = line.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}[ -]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ -]+\d{2,4}?)/i);
          const amounts = [...line.matchAll(/(?:Rs\.?|INR|₹|\$)?\s*([\d,]+\.\d{2})/ig)].map(m => parseFloat(m[1].replace(/,/g, '')));
          
          if (dateMatch) {
             if (currentTxn) {
                 const finalized = finalizeTxn(currentTxn);
                 if (finalized && (finalized.candidates.length > 0)) parsedRows.push(finalized);
             }
             currentTxn = {
                 dateStr: dateMatch[0],
                 description: line.replace(dateMatch[0], '').trim(),
                 amounts: amounts
             };
          } else if (currentTxn) {
             currentTxn.description += ' ' + line.trim();
             if (amounts.length > 0) {
                 currentTxn.amounts.push(...amounts);
             }
          }
      });
      if (currentTxn) {
          const finalized = finalizeTxn(currentTxn);
          if (finalized && finalized.candidates.length > 0) parsedRows.push(finalized);
      }

      // Determine sorting order (Oldest first or Newest first)
      let isChronological = true; 
      if (parsedRows.length >= 2) {
          for(let i = 0; i < parsedRows.length - 1; i++) {
             let curr = parsedRows[i];
             let nxt = parsedRows[i+1];
             
             // Check if nxt.balance can be reached from curr.balance by applying any candidate amount
             let matchesNext = nxt.candidates.some(amt => 
                Math.abs(curr.balance + amt - nxt.balance) < 0.1 || 
                Math.abs(curr.balance - amt - nxt.balance) < 0.1
             );

             if (matchesNext) {
                 isChronological = true;
                 break;
             }
             
             // Check reverse
             let matchesPrevFromNext = curr.candidates.some(amt => 
                Math.abs(nxt.balance + amt - curr.balance) < 0.1 || 
                Math.abs(nxt.balance - amt - curr.balance) < 0.1
             );

             if (matchesPrevFromNext) {
                 isChronological = false;
                 break;
             }
          }
      }

      const chronRows = isChronological ? [...parsedRows] : [...parsedRows].reverse();
      const transactions = [];

      chronRows.forEach((row, idx) => {
         let type = 'expense'; 
         let finalAmt = row.candidates[0] || 0;

         if (idx > 0) {
             let prevBalance = chronRows[idx - 1].balance;
             // Mathematical Verification: PrevBalance +/- Amt == CurrentBalance
             let incomeAmt = row.candidates.find(amt => Math.abs(prevBalance + amt - row.balance) < 0.1);
             let expenseAmt = row.candidates.find(amt => Math.abs(prevBalance - amt - row.balance) < 0.1);

             if (incomeAmt !== undefined) {
                 type = 'income';
                 finalAmt = incomeAmt;
             } else if (expenseAmt !== undefined) {
                 type = 'expense';
                 finalAmt = expenseAmt;
             } else {
                 // Math failed (maybe a missing line), fall back to keywords
                 if (/deposit|credited|received|salary|int\.?pd/i.test(row.description)) type = 'income';
                 finalAmt = row.candidates[0] || 0;
             }
         } else {
             // Inference for first row
             if (/deposit|credited|received|salary|int\.?pd/i.test(row.description)) type = 'income';
             finalAmt = row.candidates[0] || 0;
         }

         transactions.push({
             Date: row.dateStr,
             Description: row.description,
             Amount: finalAmt,
             Type: type
         });
      });

      if (!isChronological) {
          transactions.reverse();
      }

      processParsedData(transactions);
    } catch (error) {
      toast.error(`Error parsing PDF: ${error.message || 'Unknown error'}`);
      console.error(error);
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedData(results.data);
        },
        error: (err) => {
          toast.error(`Error parsing CSV: ${err.message}`);
          setIsImporting(false);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          processParsedData(json);
        } catch (error) {
          toast.error('Error reading Excel file');
          console.error(error);
          setIsImporting(false);
        }
      };
      reader.onerror = () => {
        toast.error('Error reading Excel file');
        setIsImporting(false);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.pdf')) {
      try {
        const url = URL.createObjectURL(file);
        processPDFContent(url);
      } catch (error) {
        toast.error('Error reading PDF file');
        setIsImporting(false);
      }
    } else {
      toast.error('Unsupported file format');
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".csv, .xlsx, .xls, .pdf" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        disabled={isImporting}
      />
      <button 
        className="btn btn-primary" 
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        disabled={isImporting}
      >
        <FiUpload /> {isImporting ? 'Importing...' : 'Import File'}
      </button>
    </div>
  );
};
